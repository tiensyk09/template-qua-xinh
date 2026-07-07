import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/plugins — Public: lấy plugin đã cài từ D1 của chính website này
// PluginRunner dùng endpoint này để biết cần render widget nào
export async function GET() {
  try {
    // Đọc manager_url để PluginRunner có thể gọi API của plugin (vd: chat endpoint)
    let managerUrl = 'https://autoweb.tubecreate.com';
    let siteName = '';
    try {
      const settings = await query(
        "SELECT `key`, `value` FROM settings WHERE `key` IN ('manager_url', 'site_name')"
      );
      settings.forEach(r => {
        if (r.key === 'manager_url') managerUrl = r.value.replace(/\/+$/, '');
        if (r.key === 'site_name') siteName = r.value;
      });
    } catch { /* ignore */ }

    // Lấy plugin đã cài từ D1 của website
    let installed = [];
    try {
      const rows = await query(
        'SELECT id, name, version, config FROM installed_plugins WHERE active = 1'
      );
      installed = rows.map(r => ({
        id: r.id,
        name: r.name,
        version: r.version,
        // Không expose toàn bộ config (có thể có API key) ra public
        // Chỉ trả về plugin id để PluginRunner biết cần render widget nào
        hasConfig: (() => {
          try {
            const cfg = typeof r.config === 'string' ? JSON.parse(r.config) : (r.config || {});
            return Object.keys(cfg).length > 0;
          } catch { return false; }
        })()
      }));
    } catch {
      // Bảng chưa tạo → trả về rỗng
      installed = [];
    }

    return NextResponse.json({ installed, managerUrl, siteName });
  } catch (err) {
    return NextResponse.json({ installed: [], error: err.message });
  }
}
