// lib/db.js — Dual-mode: D1 (Cloudflare) hoặc MySQL (local dev)

let _mysqlPool = global._mysqlPool || null;

// ── MySQL cho local development ──────────────────────────────────────────────
function translateSqlForMysql(sql) {
  return sql
    .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY')
    .replace(/datetime\('now'\)/gi, 'NOW()')
    .replace(/LONGTEXT NOT NULL/gi, 'LONGTEXT')
    // MySQL cấm cột TEXT/JSON/BLOB có DEFAULT hằng — bỏ mệnh đề DEFAULT, giữ NOT NULL nếu có
    .replace(/\b(TINYTEXT|MEDIUMTEXT|LONGTEXT|TEXT|JSON|BLOB)(\s+NOT\s+NULL)?\s+DEFAULT\s+('(?:[^']|'')*'|"[^"]*")/gi, '$1$2')
    // MySQL cần độ dài khi cột TEXT làm khóa — đổi sang VARCHAR(255)
    .replace(/\bTEXT(\s+PRIMARY\s+KEY)/gi, 'VARCHAR(255)$1')
    .replace(/\bTEXT(\s+UNIQUE)/gi, 'VARCHAR(255)$1')
    .replace(/INSERT OR IGNORE/gi, 'INSERT IGNORE')
    .replace(/INSERT OR REPLACE/gi, 'REPLACE');
}

async function mysqlQuery(sql, params = []) {
  if (!_mysqlPool) {
    const mysql = await import('mysql2/promise');
    _mysqlPool = mysql.default.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'coffee_machine',
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 5,
    });
    global._mysqlPool = _mysqlPool;
  }
  const translatedSql = translateSqlForMysql(sql);
  const [rows] = await _mysqlPool.query(translatedSql, params);
  return rows;
}

// ── D1 cho Cloudflare Workers/Pages ─────────────────────────────────────────
async function d1Query(db, sql, params = []) {
  const upper = sql.trim().toUpperCase();
  const stmt = params.length ? db.prepare(sql).bind(...params) : db.prepare(sql);

  if (/^\s*(SELECT|WITH|PRAGMA|EXPLAIN)/i.test(upper)) {
    const r = await stmt.all();
    return r.results ?? [];
  } else {
    const r = await stmt.run();
    // Trả về interface tương thích mysql2
    return {
      insertId: r.meta?.last_row_id ?? 0,
      affectedRows: r.meta?.changes ?? 0,
    };
  }
}

// ── Entry point dùng trong tất cả API routes ─────────────────────────────────
export async function query(sql, params = []) {
  // Thử D1 trước (Cloudflare runtime)
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB) {
      return d1Query(ctx.env.DB, sql, params);
    }
  } catch {
    // Không phải Cloudflare — dùng MySQL local
  }

  // Fallback: MySQL (local dev)
  return mysqlQuery(sql, params);
}

// ── Expose D1 db handle trực tiếp (dùng trong initDb) ──────────────────────
export async function getD1() {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    return ctx?.env?.DB ?? null;
  } catch {
    return null;
  }
}
