'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import '@/app/admin/admin.css';

const STATUS_LABEL = {
  new: { text: 'Mới', color: '#2563eb', bg: '#dbeafe' },
  read: { text: 'Đã đọc', color: '#ef7d9c', bg: '#fbe4ec' },
  archived: { text: 'Lưu trữ', color: '#6b7280', bg: '#f3f4f6' },
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [unread, setUnread] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadMessages();
  }, [statusFilter]);

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await fetch(`/api/contact?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setUnread(data.unread || 0);
      } else {
        setMsg({ type: 'error', text: 'Không thể tải danh sách tin nhắn' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadMessages();
        if (selected && selected.id === id) setSelected({ ...selected, status });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi cập nhật trạng thái' });
      setTimeout(() => setMsg(null), 3000);
    }
  }

  async function deleteMessage(id) {
    if (!confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelected(null);
        loadMessages();
        setMsg({ type: 'success', text: 'Đã xóa tin nhắn' });
        setTimeout(() => setMsg(null), 3000);
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi xóa tin nhắn' });
      setTimeout(() => setMsg(null), 3000);
    }
  }

  function openMessage(m) {
    setSelected(m);
    if (m.status === 'new') updateStatus(m.id, 'read');
  }

  function fmtDate(s) {
    if (!s) return '';
    const d = new Date(s.includes('T') ? s : s.replace(' ', 'T'));
    return isNaN(d) ? s : d.toLocaleString('vi-VN');
  }

  const filters = [
    { value: 'all', label: 'Tất cả' },
    { value: 'new', label: 'Mới' },
    { value: 'read', label: 'Đã đọc' },
    { value: 'archived', label: 'Lưu trữ' },
  ];

  return (
    <AdminShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Tin nhắn liên hệ</h1>
          <p style={{ color: 'var(--admin-muted, #6b7280)', fontSize: 13, marginTop: 4 }}>
            Tin nhắn khách gửi từ trang Liên hệ. {unread > 0 && <strong style={{ color: '#2563eb' }}>{unread} tin chưa đọc</strong>}
          </p>
        </div>
        <select className="adm-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {filters.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600, backgroundColor: msg.type === 'error' ? '#fee2e2' : '#fbe4ec', color: msg.type === 'error' ? '#b91c1c' : '#15803d' }}>
          {msg.text}
        </div>
      )}

      <div className="adm-card">
        {loading ? (
          <div className="adm-empty"><div className="adm-empty-text">Đang tải...</div></div>
        ) : messages.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">✉️</div>
            <div className="adm-empty-text">Chưa có tin nhắn nào.</div>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Người gửi</th>
                  <th>Liên hệ</th>
                  <th>Nội dung</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => {
                  const st = STATUS_LABEL[m.status] || STATUS_LABEL.read;
                  return (
                    <tr key={m.id} style={{ fontWeight: m.status === 'new' ? 700 : 400, cursor: 'pointer' }} onClick={() => openMessage(m)}>
                      <td style={{ fontWeight: 700 }}>{m.name}</td>
                      <td style={{ fontSize: 12.5 }}>
                        {m.phone && <div>📞 {m.phone}</div>}
                        {m.email && <div style={{ color: 'var(--admin-muted,#6b7280)' }}>✉️ {m.email}</div>}
                      </td>
                      <td style={{ maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13 }}>
                        {m.subject ? <strong>{m.subject}: </strong> : ''}{m.message}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--admin-muted,#6b7280)', whiteSpace: 'nowrap' }}>{fmtDate(m.created_at)}</td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, backgroundColor: st.bg, color: st.color }}>{st.text}</span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => openMessage(m)} style={btnStyle('#2563eb')}>Xem</button>
                        <button onClick={() => deleteMessage(m.id)} style={btnStyle('#dc2626')}>Xóa</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="adm-modal-container" style={{ background: '#fff', borderRadius: 12, maxWidth: 560, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>{selected.name}</h2>
                <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 4 }}>{fmtDate(selected.created_at)}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {selected.phone && <div style={fieldBox}><div style={fieldLabel}>Điện thoại</div><a href={`tel:${selected.phone}`} style={{ fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>{selected.phone}</a></div>}
              {selected.email && <div style={fieldBox}><div style={fieldLabel}>Email</div><a href={`mailto:${selected.email}`} style={{ fontWeight: 700, color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}>{selected.email}</a></div>}
            </div>
            {selected.subject && <div style={{ ...fieldBox, marginBottom: 12 }}><div style={fieldLabel}>Chủ đề</div><div style={{ fontWeight: 600 }}>{selected.subject}</div></div>}
            <div style={{ ...fieldBox, marginBottom: 20 }}>
              <div style={fieldLabel}>Nội dung</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.message}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {selected.status !== 'archived' && <button onClick={() => updateStatus(selected.id, 'archived')} style={modalBtn('#6b7280')}>Lưu trữ</button>}
              {selected.status === 'archived' && <button onClick={() => updateStatus(selected.id, 'read')} style={modalBtn('#ef7d9c')}>Khôi phục</button>}
              <button onClick={() => deleteMessage(selected.id)} style={modalBtn('#dc2626')}>Xóa tin nhắn</button>
              <a href={`tel:${selected.phone || ''}`} style={{ ...modalBtn('#2563eb'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Gọi lại</a>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

const btnStyle = (color) => ({ background: 'none', border: `1px solid ${color}`, color, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6, cursor: 'pointer', marginLeft: 6, fontFamily: 'inherit' });
const modalBtn = (color) => ({ background: color, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' });
const fieldBox = { background: '#f9fafb', border: '1px solid #f0f0f0', borderRadius: 8, padding: '10px 12px' };
const fieldLabel = { fontSize: 10.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 };
