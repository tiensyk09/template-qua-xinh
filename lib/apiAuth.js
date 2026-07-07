import { query } from '@/lib/db';

// Đọc API token từ header (X-API-Key hoặc Authorization: Bearer) và đối chiếu bảng api_keys.
// Trả về { id, viaApiKey: true, keyName } nếu hợp lệ, ngược lại null.
export async function apiKeyValid(request) {
  try {
    const h = request.headers;
    let token = (h.get('x-api-key') || '').trim();
    if (!token) {
      const a = h.get('authorization') || '';
      const lower = a.toLowerCase();
      if (lower.startsWith('bearer ')) {
        token = a.slice(7).trim();
      } else if (lower.startsWith('basic ')) {
        // Kiểu WordPress Application Password: Basic base64("username:token")
        try {
          const raw = a.slice(6).trim();
          const decoded = typeof atob === 'function' ? atob(raw) : Buffer.from(raw, 'base64').toString('utf8');
          const idx = decoded.indexOf(':');
          if (idx >= 0) token = decoded.slice(idx + 1).replace(/\s+/g, '').trim(); // bỏ khoảng trắng như app password WP
        } catch { /* header sai định dạng */ }
      }
    }
    token = token.replace(/\s+/g, '');
    if (!token) return null;
    const rows = await query('SELECT id, name, user_id FROM api_keys WHERE api_key = ? LIMIT 1', [token]);
    if (rows && rows.length) return { id: rows[0].user_id, viaApiKey: true, keyName: rows[0].name };
  } catch { /* bảng chưa có hoặc lỗi -> coi như không hợp lệ */ }
  return null;
}

// Trả về user thực thi: session đang đăng nhập, HOẶC user giả suy ra từ API token hợp lệ.
// Dùng cho endpoint ghi: gọi resolveUser rồi requireAuth như cũ (không phá logic session).
export async function resolveUser(request, sessionUser) {
  if (sessionUser) return sessionUser;
  const ak = await apiKeyValid(request);
  if (ak) return { id: ak.id || 1, displayName: ak.keyName || 'API Client', username: 'api', role: 'admin', viaApiKey: true };
  return null;
}
