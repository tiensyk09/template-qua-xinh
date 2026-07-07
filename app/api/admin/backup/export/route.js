import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Bảng dữ liệu nội dung (KHÔNG gồm installed_plugins/api_keys/download_tokens vì chứa khóa bí mật)
const BACKUP_TABLES = [
  'users', 'settings', 'file_categories', 'shop_categories', 'products', 'product_variants',
  'posts', 'pages', 'files', 'post_attachments', 'coupons', 'orders', 'order_items', 'product_reviews'
];

function generateSqlBackup(table, rows) {
  if (!rows || rows.length === 0) return `-- Không có dữ liệu cho bảng ${table}\n\n`;
  const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
  let sql = `-- Backup bảng \`${table}\`\n`;
  for (const row of rows) {
    const values = Object.values(row).map(val => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      return `'${String(val).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
    }).join(', ');
    sql += `INSERT INTO \`${table}\` (${columns}) VALUES (${values});\n`;
  }
  return sql + '\n';
}

// GET /api/admin/backup/export?include_db=&include_files=
export async function GET(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { searchParams } = new URL(request.url);
    const includeDb = searchParams.get('include_db') !== 'false';
    const includeFiles = searchParams.get('include_files') !== 'false';

    const dbData = {};
    let fullSql = `-- Quà Xinh - SQL backup tự sinh\n-- Thời điểm: ${new Date().toISOString()}\n\n`;

    if (includeDb) {
      for (const table of BACKUP_TABLES) {
        try {
          const rows = await query(`SELECT * FROM \`${table}\``);
          dbData[table] = rows || [];
          fullSql += generateSqlBackup(table, rows || []);
        } catch (e) {
          dbData[table] = []; // bảng chưa có → bỏ qua
        }
      }
    }

    const fileUrls = [];
    if (includeFiles) {
      try {
        const a = await query('SELECT url FROM files');
        const b = await query('SELECT url FROM post_attachments');
        (a || []).forEach(f => { if (f.url) fileUrls.push(f.url); });
        (b || []).forEach(f => { if (f.url) fileUrls.push(f.url); });
      } catch { /* bỏ qua */ }
    }
    // chỉ giữ file nội bộ (uploads/R2), bỏ link ngoài
    const uniqueUrls = [...new Set(fileUrls)].filter(url =>
      !(url.startsWith('http') && !url.includes('/uploads/') && !url.includes('/api/uploads/'))
    );

    return NextResponse.json({
      success: true,
      database_backup_json: includeDb ? { metadata: { version: '1.0', exported_at: new Date().toISOString(), tables: Object.keys(dbData) }, data: dbData } : null,
      database_backup_sql: includeDb ? fullSql : null,
      files: includeFiles ? uniqueUrls : []
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
