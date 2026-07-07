import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/api-keys — liệt kê token
export async function GET() {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });
  try {
    const rows = await query('SELECT id, name, api_key, created_at FROM api_keys ORDER BY id DESC');
    return NextResponse.json({ keys: rows || [] });
  } catch (err) {
    return NextResponse.json({ keys: [], error: err.message });
  }
}

// POST /api/admin/api-keys — tạo token mới
export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });
  try {
    const body = await request.json().catch(() => ({}));
    const keyName = String(body.name || 'API Key').slice(0, 100);
    const token = 'sk_' + (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '');
    const uid = user.id || user.userId || user.sub || 1;
    await query('INSERT INTO api_keys (name, api_key, user_id) VALUES (?, ?, ?)', [keyName, token, uid]);
    const rows = await query('SELECT id, name, api_key, created_at FROM api_keys WHERE api_key = ?', [token]);
    return NextResponse.json({ success: true, key: rows?.[0] || { name: keyName, api_key: token } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
