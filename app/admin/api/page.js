'use client';
import React, { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';

const ENDPOINTS = [
  { method: 'GET', path: '/api/products?limit=12', desc: 'Danh sách sản phẩm (limit, cat)' },
  { method: 'GET', path: '/api/products/moc-khoa-day-beaded-nhieu-mau', desc: 'Chi tiết sản phẩm theo slug/id' },
  { method: 'GET', path: '/api/shop-categories', desc: 'Danh mục sản phẩm' },
  { method: 'GET', path: '/api/posts?status=published&limit=5', desc: 'Danh sách bài viết đã đăng' },
  { method: 'GET', path: '/api/posts/1', desc: 'Chi tiết bài viết theo id' },
  { method: 'GET', path: '/api/pages', desc: 'Trang tùy chỉnh (Page Builder)' },
  { method: 'GET', path: '/api/settings', desc: 'Cấu hình công khai của website' },
  { method: 'GET', path: '/api/files', desc: 'Thư viện media' },
  { method: 'POST', path: '/api/coupons/validate', desc: 'Kiểm tra mã giảm giá', body: '{\n  "code": "QUAXINH10",\n  "orderTotal": 5000000\n}' },
  { method: 'POST', path: '/api/contact', desc: 'Gửi liên hệ / đăng ký', body: '{\n  "name": "Nguyễn Văn A",\n  "phone": "0900000000",\n  "message": "Xin tư vấn"\n}' },
  { method: 'POST', path: '/api/posts', desc: 'Tạo bài viết 🔒 (cần token)', body: '{\n  "title": "Bài viết từ API",\n  "content": "Nội dung bài viết...",\n  "status": "published"\n}' },
];

export default function ApiDevPage() {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/api/products?limit=3');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);

  // ── API keys / token ──
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState(null);

  // ── Token dùng để test + upload ảnh ──
  const [token, setToken] = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const [uploaded, setUploaded] = useState(null);

  useEffect(() => { loadKeys(); }, []);
  async function loadKeys() {
    try { const r = await fetch('/api/admin/api-keys'); if (r.ok) { const d = await r.json(); setKeys(d.keys || []); } } catch {}
  }
  async function createKey() {
    if (creating) return;
    setCreating(true); setJustCreated(null);
    try {
      const r = await fetch('/api/admin/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newKeyName || 'API Key' }) });
      const d = await r.json();
      if (r.ok && d.key) { setJustCreated(d.key.api_key); setNewKeyName(''); loadKeys(); }
      else alert('Lỗi tạo token: ' + (d.error || ''));
    } catch (e) { alert('Lỗi: ' + e.message); } finally { setCreating(false); }
  }
  async function deleteKey(id) {
    if (!confirm('Thu hồi token này?')) return;
    try { await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' }); loadKeys(); } catch {}
  }

  // ── Upload ảnh (dùng token) → trả URL để làm ảnh đại diện bài viết ──
  function readAsDataURL(file) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
  }
  function makeThumb(dataUrl, max = 400) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        try { res(c.toDataURL('image/jpeg', 0.8)); } catch { res(null); }
      };
      img.onerror = () => res(null);
      img.src = dataUrl;
    });
  }
  async function uploadImage(file) {
    if (!token.trim()) { alert('Nhập API Token phía trên trước khi upload.'); return; }
    setImgUploading(true); setUploaded(null);
    try {
      const dataUrl = await readAsDataURL(file);
      const thumbDataUrl = await makeThumb(dataUrl);
      const r = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': token.trim() }, body: JSON.stringify({ dataUrl, filename: file.name, thumbDataUrl }) });
      const d = await r.json();
      if (r.ok && d.url) setUploaded({ url: d.url, thumb: d.thumbnailUrl || d.thumb_url || d.thumbUrl || null });
      else alert('Upload lỗi: ' + (d.error || r.status));
    } catch (e) { alert('Lỗi: ' + e.message); } finally { setImgUploading(false); }
  }
  function insertImageToBody(url) {
    setMethod('POST'); if (!path.includes('/api/posts')) setPath('/api/posts');
    let obj = {};
    try { obj = body.trim() ? JSON.parse(body) : {}; } catch { obj = { title: 'Bài viết từ API', content: '...', status: 'published' }; }
    obj.image = url;
    setBody(JSON.stringify(obj, null, 2));
  }

  function pick(ep) {
    setMethod(ep.method); setPath(ep.path); setBody(ep.body || ''); setResp(null);
  }

  async function send() {
    setLoading(true); setResp(null);
    const t0 = performance.now();
    try {
      const opts = { method, headers: {} };
      if (token.trim()) opts.headers['X-API-Key'] = token.trim();
      if (method !== 'GET' && body.trim()) { opts.headers['Content-Type'] = 'application/json'; opts.body = body; }
      const r = await fetch(path, opts);
      const text = await r.text();
      let pretty = text; try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      setResp({ status: r.status, ok: r.ok, ms: Math.round(performance.now() - t0), body: pretty });
    } catch (err) {
      setResp({ status: 0, ok: false, ms: 0, body: 'Lỗi: ' + err.message });
    } finally { setLoading(false); }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const authH = token.trim() ? ` \\\n  -H "X-API-Key: ${token.trim()}"` : '';
  const curl = `curl -X ${method} "${origin}${path}"${authH}${method !== 'GET' && body.trim() ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${body.replace(/\n/g, '')}'` : ''}`;

  const box = { background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: 14, padding: 20 };
  const input = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: 13, fontFamily: 'monospace', outline: 'none' };
  const mColor = (m) => m === 'GET' ? '#16a34a' : m === 'POST' ? '#d97706' : '#6366f1';

  return (
    <AdminShell title="API cho Developer">
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 6 }}>API cho Developer</h1>
      <p style={{ color: 'var(--admin-muted)', fontSize: 13, marginBottom: 20 }}>REST API của website. Bấm một endpoint để nạp vào khung test, chỉnh và gửi thử ngay.</p>

      {/* API TOKEN */}
      <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>API Token</h2>
        <p style={{ color: 'var(--admin-muted)', fontSize: 12.5, marginBottom: 8, lineHeight: 1.6 }}>Token cho client bên ngoài gọi các API ghi (tạo bài viết, upload…). Đọc công khai không cần token; <strong>ghi thì bắt buộc</strong>. 3 cách gửi (giống WordPress REST API):</p>
        <ul style={{ margin: '0 0 14px', paddingLeft: 18, color: 'var(--admin-muted)', fontSize: 12, lineHeight: 1.9 }}>
          <li><code>X-API-Key: &lt;token&gt;</code></li>
          <li><code>Authorization: Bearer &lt;token&gt;</code></li>
          <li><code>Authorization: Basic base64("user:&lt;token&gt;")</code> — kiểu Application Password của WordPress</li>
        </ul>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="Tên token (vd: App di động, Zapier...)" style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: 13, outline: 'none' }} />
          <button onClick={createKey} disabled={creating} style={{ background: 'var(--admin-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', opacity: creating ? 0.6 : 1 }}>{creating ? '...' : '+ Tạo token'}</button>
        </div>
        {justCreated && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 700, marginBottom: 6 }}>✅ Token mới — sao chép & lưu lại ngay:</div>
            <code style={{ fontSize: 12, color: 'var(--admin-text)', wordBreak: 'break-all', display: 'block' }}>{justCreated}</code>
          </div>
        )}
        {keys.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {keys.map(k => (
              <div key={k.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{k.name}</div>
                  <code style={{ fontSize: 11, color: 'var(--admin-muted)' }}>{String(k.api_key).slice(0, 10)}••••••{String(k.api_key).slice(-4)}</code>
                </div>
                <button onClick={() => deleteKey(k.id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '5px 10px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Thu hồi</button>
              </div>
            ))}
          </div>
        ) : <div style={{ fontSize: 12.5, color: 'var(--admin-muted)' }}>Chưa có token nào.</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20 }} className="api-grid">
        {/* Danh sách endpoint */}
        <div style={box}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Endpoints</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ENDPOINTS.map((ep, i) => (
              <button key={i} onClick={() => pick(ep)} style={{ textAlign: 'left', background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '9px 11px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: mColor(ep.method), padding: '2px 6px', borderRadius: 4 }}>{ep.method}</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--admin-text)', wordBreak: 'break-all' }}>{ep.path.split('?')[0]}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--admin-muted)', marginTop: 4 }}>{ep.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tester */}
        <div style={box}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Thử API</h2>
          <input value={token} onChange={e => setToken(e.target.value)} placeholder="🔑 API Token (sk_...) — cần cho endpoint 🔒 & upload ảnh"
            style={{ ...input, marginBottom: 10, fontFamily: 'inherit' }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <select value={method} onChange={e => setMethod(e.target.value)} style={{ ...input, width: 90, fontWeight: 700, color: mColor(method) }}>
              <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
            </select>
            <input value={path} onChange={e => setPath(e.target.value)} placeholder="/api/..." style={input} />
          </div>
          {method !== 'GET' && (
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder='Body JSON (tùy chọn)' rows={5} style={{ ...input, marginBottom: 10, resize: 'vertical' }} />
          )}
          <button onClick={send} disabled={loading} style={{ background: 'var(--admin-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Đang gửi...' : '▶ Gửi'}
          </button>

          {resp && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--admin-muted)' }}>
                Status: <strong style={{ color: resp.ok ? '#16a34a' : '#ef4444' }}>{resp.status}</strong> · {resp.ms}ms
              </div>
              <pre style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: 14, fontSize: 12, color: 'var(--admin-text)', whiteSpace: 'pre-wrap', maxHeight: 340, overflow: 'auto', margin: 0 }}>{resp.body}</pre>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11.5, color: 'var(--admin-muted)', marginBottom: 6 }}>Ví dụ curl:</div>
            <pre style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: 12, fontSize: 11.5, color: 'var(--admin-text)', whiteSpace: 'pre-wrap', margin: 0 }}>{curl}</pre>
          </div>

          {/* UPLOAD ẢNH ĐẠI DIỆN */}
          <div style={{ marginTop: 16, borderTop: '1px solid var(--admin-border)', paddingTop: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 4 }}>🖼️ Upload ảnh (dùng token) → lấy URL làm ảnh đại diện bài viết</div>
            <div style={{ fontSize: 11.5, color: 'var(--admin-muted)', marginBottom: 10 }}>Chọn ảnh → tự tạo thumbnail → gọi <code>POST /api/upload</code> kèm token → trả URL để gắn vào <code>image</code> của bài viết.</div>
            <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ''; }} style={{ fontSize: 12, color: 'var(--admin-text)', marginBottom: 10, display: 'block' }} />
            {imgUploading && <div style={{ fontSize: 12, color: 'var(--admin-muted)' }}>Đang tải ảnh lên...</div>}
            {uploaded && (
              <div style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: 12 }}>
                {uploaded.thumb && <img src={uploaded.thumb} alt="thumbnail" style={{ maxWidth: 120, borderRadius: 6, marginBottom: 8, display: 'block' }} />}
                <div style={{ fontSize: 11.5, color: 'var(--admin-muted)', marginBottom: 8 }}>Ảnh đại diện: <code style={{ color: 'var(--admin-text)', wordBreak: 'break-all' }}>{uploaded.url}</code></div>
                {uploaded.thumb_url && <div style={{ fontSize: 11.5, color: 'var(--admin-muted)', marginBottom: 8 }}>Thumbnail: <code style={{ color: 'var(--admin-text)', wordBreak: 'break-all' }}>{uploaded.thumb_url}</code></div>}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => insertImageToBody(uploaded.url)} style={{ background: 'var(--admin-primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Chèn làm ảnh đại diện (POST /api/posts)</button>
                  <button onClick={() => { try { navigator.clipboard.writeText(uploaded.url); } catch {} }} style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Copy URL</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 820px){ .api-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
    </AdminShell>
  );
}
