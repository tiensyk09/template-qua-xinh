import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ─── Helper: đọc manager_url từ settings ─────────────────────────────────────
async function getManagerUrl() {
  try {
    const rows = await query("SELECT `key`, `value` FROM settings WHERE `key` IN ('manager_url')");
    const cfg = {};
    rows.forEach(r => { cfg[r.key] = r.value; });
    return (cfg.manager_url || 'https://autoweb.tubecreate.com').replace(/\/+$/, '');
  } catch {
    return 'https://autoweb.tubecreate.com';
  }
}

// ─── GET: Lấy plugin từ store + danh sách đã cài từ DB riêng của website ─────
export async function GET() {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const managerUrl = await getManagerUrl();

    // 1. Fetch danh sách plugin marketplace từ manager (chỉ list, không lưu trạng thái)
    let storePlugins = [];
    try {
      const storeRes = await fetch(`${managerUrl}/api/plugins`, {
        headers: { 'X-User-Email': user.email || 'admin' },
        next: { revalidate: 0 }
      });
      if (storeRes.ok) {
        const storeData = await storeRes.json();
        storePlugins = storeData.plugins || [];
      }
    } catch {
      // Manager không phản hồi → vẫn hoạt động với DB local
    }

    // 2. Đọc plugin đã cài từ D1 của chính website này
    const rows = await query('SELECT id, name, version, config, active, installed_at FROM installed_plugins WHERE active = 1');
    const installed = rows.map(r => ({
      id: r.id,
      name: r.name,
      version: r.version,
      config: typeof r.config === 'string' ? JSON.parse(r.config) : (r.config || {}),
      installedAt: r.installed_at
    }));

    return NextResponse.json({ plugins: storePlugins, installed });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST: Cài đặt (install) hoặc Gỡ (uninstall) — lưu vào D1 của website ───
export async function POST(req) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { action, pluginId, pluginName, pluginVersion, config: pluginConfig } = await req.json();
    if (!pluginId) return NextResponse.json({ error: 'Plugin ID is required' }, { status: 400 });

    if (action === 'install') {
      // Đảm bảo bảng tồn tại (auto-create nếu chưa có)
      await query(`
        CREATE TABLE IF NOT EXISTS installed_plugins (
          id TEXT PRIMARY KEY, name TEXT NOT NULL, version TEXT DEFAULT '1.0.0',
          config TEXT DEFAULT '{}', active INTEGER NOT NULL DEFAULT 1,
          installed_at DATETIME DEFAULT (datetime('now'))
        )
      `);

      // Upsert vào D1
      await query(
        `REPLACE INTO installed_plugins (id, name, version, config, active) VALUES (?, ?, ?, ?, 1)`,
        [pluginId, pluginName || pluginId, pluginVersion || '1.0.0', JSON.stringify(pluginConfig || {})]
      );

      return NextResponse.json({ success: true, message: `Đã cài plugin "${pluginName || pluginId}"` });
    }

    if (action === 'uninstall') {
      await query('DELETE FROM installed_plugins WHERE id = ?', [pluginId]);
      return NextResponse.json({ success: true, message: `Đã gỡ plugin "${pluginId}"` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── PATCH: Cập nhật config plugin — lưu vào D1 của website ─────────────────
export async function PATCH(req) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { pluginId, config: pluginConfig } = await req.json();
    if (!pluginId || !pluginConfig) {
      return NextResponse.json({ error: 'Plugin ID and config are required' }, { status: 400 });
    }

    await query(
      'UPDATE installed_plugins SET config = ? WHERE id = ?',
      [JSON.stringify(pluginConfig), pluginId]
    );

    return NextResponse.json({ success: true, message: 'Config đã được cập nhật' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
