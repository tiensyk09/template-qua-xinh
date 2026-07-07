import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';
import JSZip from 'jszip';

export const dynamic = 'force-dynamic';

async function writeUploadedFile(name, buffer, r2Bucket) {
  if (r2Bucket) {
    try {
      const ext = name.split('.').pop()?.toLowerCase() || '';
      let mimeType = 'application/octet-stream';
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext}`;
      else if (ext === 'pdf') mimeType = 'application/pdf';
      await r2Bucket.put(name, buffer, { httpMetadata: { contentType: mimeType } });
      return true;
    } catch (err) { /* fallback local */ }
  }
  try {
    const fs = await import('fs');
    const path = await import('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, name), Buffer.from(buffer));
    return true;
  } catch (err) { return false; }
}

// Thứ tự FK-safe cho e-commerce
const INSERT_ORDER = ['users', 'settings', 'file_categories', 'shop_categories', 'products', 'product_variants', 'posts', 'pages', 'files', 'post_attachments', 'coupons', 'orders', 'order_items', 'product_reviews'];
const DELETE_ORDER = [...INSERT_ORDER].reverse();

export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return NextResponse.json({ error: 'Không tìm thấy tệp tải lên' }, { status: 400 });

    const zip = await JSZip.loadAsync(await file.arrayBuffer());

    let r2Bucket = null;
    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const ctx = getCloudflareContext();
      if (ctx?.env?.R2_BUCKET) r2Bucket = ctx.env.R2_BUCKET;
    } catch { /* local dev */ }

    const dbBackupFile = zip.file('database_backup.json');
    const stats = { cleared: [], inserted: {}, filesRestored: 0 };

    // 1. Khôi phục DB (nếu có trong zip)
    if (dbBackupFile) {
      const backupData = JSON.parse(await dbBackupFile.async('text'));
      const dbData = backupData?.data;
      if (!dbData) return NextResponse.json({ error: 'Dữ liệu sao lưu không hợp lệ' }, { status: 400 });

      for (const table of DELETE_ORDER) {
        try { await query(`DELETE FROM \`${table}\``); stats.cleared.push(table); } catch { /* bỏ qua */ }
      }
      for (const table of INSERT_ORDER) {
        const rows = dbData[table];
        stats.inserted[table] = 0;
        if (Array.isArray(rows) && rows.length) {
          for (const row of rows) {
            try {
              const keys = Object.keys(row);
              const cols = keys.map(k => `\`${k}\``).join(', ');
              const placeholders = keys.map(() => '?').join(', ');
              await query(`INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`, Object.values(row));
              stats.inserted[table]++;
            } catch (e) { /* bỏ dòng lỗi */ }
          }
        }
      }
    }

    // 2. Khôi phục file trong uploads/
    const uploadsFolder = zip.folder('uploads');
    if (uploadsFolder) {
      const entries = [];
      uploadsFolder.forEach((rel, entry) => { if (!entry.dir) entries.push({ name: rel, file: entry }); });
      for (const entry of entries) {
        const buffer = await entry.file.async('uint8array');
        if (await writeUploadedFile(entry.name, buffer, r2Bucket)) stats.filesRestored++;
      }
    }

    return NextResponse.json({ success: true, message: 'Khôi phục hoàn tất!', stats });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
