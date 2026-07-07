'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   LIVE EDITOR — chỉnh sửa nội dung trang ngay trên giao diện
   khi đăng nhập quyền admin/mod. Nội dung lưu ở settings.home_content (JSON).
   Dùng:  <Editable k="hero_title" def="..." as="h1" />
          <EditableImg k="hero_img" def="..." alt="..." style={...} />
   Bọc app bằng <LiveEditorProvider> (đặt trong LayoutWrapper).
───────────────────────────────────────────────────────────── */

const Ctx = createContext(null);
export function useLive() {
  return useContext(Ctx) || { get: (k, d) => d, setField: () => {}, isAdmin: false, editing: false };
}

export function LiveEditorProvider({ children }) {
  const [content, setContent] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.settings?.home_content) { try { setContent(JSON.parse(d.settings.home_content)); } catch {} }
    }).catch(() => {});
    fetch('/api/auth/login').then(r => r.ok ? r.json() : null).then(d => {
      const u = d?.user; const role = u?.role || u?.roles;
      if (u && (String(role).includes('admin') || String(role).includes('mod'))) setIsAdmin(true);
    }).catch(() => {});
  }, []);

  const get = useCallback((k, def) => {
    const v = content[k];
    return (v !== undefined && v !== null && v !== '') ? v : def;
  }, [content]);

  const setField = useCallback((k, v) => { setContent(c => ({ ...c, [k]: v })); setDirty(true); }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home_content: JSON.stringify(content) })
      });
      if (res.ok) { setDirty(false); setEditing(false); }
      else alert('Lưu thất bại — cần đăng nhập quyền admin.');
    } catch { alert('Lỗi kết nối, thử lại.'); } finally { setSaving(false); }
  }, [content]);

  return (
    <Ctx.Provider value={{ content, get, setField, isAdmin, editing, setEditing, dirty, save, saving }}>
      {children}
      {isAdmin && <EditToolbar editing={editing} setEditing={setEditing} dirty={dirty} save={save} saving={saving} />}
    </Ctx.Provider>
  );
}

function EditToolbar({ editing, setEditing, dirty, save, saving }) {
  const btn = { background: '#2b2b2b', color: '#fff', border: 'none', borderRadius: 999, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' };
  return (
    <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 99999, display: 'flex', gap: 8, alignItems: 'center', background: '#111', padding: 8, borderRadius: 999, boxShadow: '0 10px 34px rgba(0,0,0,0.45)' }}>
      {!editing ? (
        <button onClick={() => setEditing(true)} style={{ ...btn, background: '#2563eb' }}>✏️ Chỉnh sửa trang</button>
      ) : (
        <>
          <span style={{ fontSize: 12, color: '#ddd', padding: '0 6px', fontFamily: 'system-ui' }}>Đang chỉnh sửa — bấm vào chữ/ảnh để sửa</span>
          <button onClick={save} disabled={!dirty || saving} style={{ ...btn, background: dirty ? '#16a34a' : '#3a3a3a', opacity: (!dirty || saving) ? 0.6 : 1 }}>{saving ? 'Đang lưu…' : '💾 Lưu'}</button>
          <button onClick={() => { if (!dirty || confirm('Bỏ các thay đổi chưa lưu?')) window.location.reload(); }} style={btn}>✖ Thoát</button>
        </>
      )}
    </div>
  );
}

// ── Editable text ──
export function Editable({ k, def = '', as = 'span', className, style, multiline = false }) {
  const { get, setField, editing } = useLive();
  const value = get(k, def);
  const Tag = as;
  if (!editing) {
    if (multiline) {
      return <Tag className={className} style={style}>{String(value).split('\n').map((l, i) => (<React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>))}</Tag>;
    }
    return <Tag className={className} style={style}>{value}</Tag>;
  }
  return (
    <Tag
      className={className}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => setField(k, e.currentTarget.innerText)}
      title="Bấm để sửa nội dung"
      style={{ ...style, outline: '2px dashed rgba(37,99,235,0.75)', outlineOffset: 2, cursor: 'text', borderRadius: 3 }}
    >{value}</Tag>
  );
}

// ── Editable image (src). fill=true cho ảnh phủ kín (position:absolute inset:0) ──
export function EditableImg({ k, def = '', alt = '', style, className, onError, fill = false }) {
  const { get, setField, editing } = useLive();
  const src = get(k, def);
  if (!editing) return <img src={src} alt={alt} style={style} className={className} onError={onError} />;
  const wrapStyle = fill
    ? { position: 'absolute', inset: 0 }
    : { position: 'relative', display: 'inline-block', width: style?.width, height: style?.height };
  return (
    <span style={wrapStyle}>
      <img src={src} alt={alt} style={style} className={className} onError={onError} />
      <button
        onClick={() => { const v = prompt('Dán URL ảnh mới:', src || ''); if (v != null) setField(k, v.trim()); }}
        style={{ position: 'absolute', top: 6, right: 6, zIndex: 6, background: 'rgba(0,0,0,0.72)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
      >🖼 Đổi ảnh</button>
    </span>
  );
}
