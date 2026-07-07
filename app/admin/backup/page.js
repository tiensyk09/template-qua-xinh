'use client';
import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import AdminShell from '@/components/admin/AdminShell';

export default function BackupPage() {
  const [exportDb, setExportDb] = useState(true);
  const [exportFiles, setExportFiles] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState(null);

  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
  const [importLogs, setImportLogs] = useState([]);
  const [confirmImport, setConfirmImport] = useState(false);
  const fileInputRef = useRef(null);

  async function handleExport() {
    if (!exportDb && !exportFiles) { setExportMsg({ type: 'error', text: 'Chọn ít nhất một nội dung (CSDL hoặc Tệp).' }); return; }
    setExporting(true);
    setExportMsg({ type: 'info', text: 'Đang trích xuất dữ liệu từ máy chủ...' });
    try {
      const qs = new URLSearchParams({ include_db: exportDb, include_files: exportFiles });
      const res = await fetch(`/api/admin/backup/export?${qs}`);
      if (!res.ok) throw new Error(await res.text() || 'Xuất thất bại');
      const info = await res.json();
      if (!info.success) throw new Error(info.error || 'Lỗi xử lý dữ liệu');

      const zip = new JSZip();
      if (exportDb && info.database_backup_json) {
        zip.file('database_backup.json', JSON.stringify(info.database_backup_json, null, 2));
        zip.file('database_backup.sql', info.database_backup_sql || '');
      }
      if (exportFiles && info.files?.length) {
        const folder = zip.folder('uploads');
        for (let i = 0; i < info.files.length; i++) {
          const url = info.files[i]; const name = url.split('/').pop(); if (!name) continue;
          setExportMsg({ type: 'info', text: `Đang tải tệp (${i + 1}/${info.files.length}): ${name}...` });
          try { const fr = await fetch(url); if (fr.ok) folder.file(name, await fr.arrayBuffer()); } catch { /* skip */ }
        }
      }
      setExportMsg({ type: 'info', text: 'Đang nén ZIP trên trình duyệt...' });
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 5 } });
      const filename = `backup-qua-xinh-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
      const dl = window.URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = dl; link.setAttribute('download', filename);
      document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(dl);
      setExportMsg({ type: 'success', text: `Đã tải bản sao lưu: ${filename}` });
    } catch (err) {
      setExportMsg({ type: 'error', text: 'Lỗi sao lưu: ' + err.message });
    } finally { setExporting(false); }
  }

  async function triggerImport() {
    setConfirmImport(false); setImporting(true);
    setImportMsg({ type: 'info', text: 'Đang khôi phục... Không tắt trình duyệt.' });
    setImportLogs(['Bắt đầu đọc tệp sao lưu...']);
    try {
      const file = fileInputRef.current.files[0];
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/admin/backup/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        const logs = ['✅ Đã giải nén ZIP.'];
        if (data.stats.cleared?.length) logs.push(`🧹 Đã xoá bảng: ${data.stats.cleared.join(', ')}`);
        Object.entries(data.stats.inserted || {}).forEach(([t, c]) => { if (c > 0) logs.push(`📥 [${t}]: ${c} bản ghi`); });
        logs.push(`🖼️ Khôi phục ${data.stats.filesRestored} tệp.`);
        logs.push('🎉 Hoàn tất!');
        setImportLogs(logs);
        setImportMsg({ type: 'success', text: 'Khôi phục hoàn tất!' });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setImportMsg({ type: 'error', text: 'Lỗi: ' + (data.error || 'không xác định') });
        setImportLogs(p => [...p, '❌ Thất bại: ' + (data.error || '')]);
      }
    } catch (err) {
      setImportMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    } finally { setImporting(false); }
  }

  const card = { background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: 14, padding: 24, marginBottom: 20 };
  const primaryBtn = { background: 'var(--admin-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 13 };
  const msgBox = (m) => m ? { padding: '10px 14px', borderRadius: 8, marginTop: 12, fontSize: 13, fontWeight: 500,
    background: m.type === 'error' ? 'rgba(239,68,68,0.12)' : m.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(var(--admin-primary-rgb),0.1)',
    color: m.type === 'error' ? '#ef4444' : m.type === 'success' ? '#16a34a' : 'var(--admin-primary)' } : {};

  return (
    <AdminShell title="Sao lưu & Khôi phục">
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 6 }}>Sao lưu & Khôi phục</h1>
      <p style={{ color: 'var(--admin-muted)', fontSize: 13, marginBottom: 24 }}>Xuất/nhập cơ sở dữ liệu (JSON + SQL) và tệp tin (ảnh/media) dưới dạng gói .zip.</p>

      {/* EXPORT */}
      <div style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>⬇️ Xuất bản sao lưu</h2>
        <p style={{ color: 'var(--admin-muted)', fontSize: 12.5, marginBottom: 16 }}>Chọn nội dung cần sao lưu rồi tải về gói .zip.</p>
        <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--admin-text)', fontSize: 13.5, fontWeight: 600 }}>
            <input type="checkbox" checked={exportDb} onChange={e => setExportDb(e.target.checked)} /> 🗄️ Cơ sở dữ liệu (SQL/JSON)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--admin-text)', fontSize: 13.5, fontWeight: 600 }}>
            <input type="checkbox" checked={exportFiles} onChange={e => setExportFiles(e.target.checked)} /> 🖼️ Tệp tin (ảnh/media)
          </label>
        </div>
        <button onClick={handleExport} disabled={exporting} style={{ ...primaryBtn, opacity: exporting ? 0.6 : 1 }}>
          {exporting ? 'Đang xử lý...' : '⬇️ Tải bản sao lưu (.zip)'}
        </button>
        {exportMsg && <div style={msgBox(exportMsg)}>{exportMsg.text}</div>}
      </div>

      {/* IMPORT */}
      <div style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>⬆️ Khôi phục từ bản sao lưu</h2>
        <p style={{ color: '#ef4444', fontSize: 12.5, marginBottom: 16, fontWeight: 600 }}>⚠️ Thao tác này sẽ XÓA dữ liệu hiện tại và thay bằng dữ liệu trong tệp .zip.</p>
        <input ref={fileInputRef} type="file" accept=".zip" style={{ display: 'block', marginBottom: 14, color: 'var(--admin-text)', fontSize: 13 }} />
        <button onClick={() => { if (!fileInputRef.current?.files?.length) { setImportMsg({ type: 'error', text: 'Chọn tệp .zip trước.' }); return; } setConfirmImport(true); }} disabled={importing}
          style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: importing ? 0.6 : 1 }}>
          {importing ? 'Đang khôi phục...' : '⬆️ Khôi phục'}
        </button>
        {importMsg && <div style={msgBox(importMsg)}>{importMsg.text}</div>}
        {importLogs.length > 0 && (
          <pre style={{ marginTop: 14, background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: 14, fontSize: 12, color: 'var(--admin-text)', whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto' }}>
            {importLogs.join('\n')}
          </pre>
        )}
      </div>

      {confirmImport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setConfirmImport(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--admin-card-bg)', borderRadius: 14, padding: 26, maxWidth: 420, width: '90%' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 10 }}>Xác nhận khôi phục</h3>
            <p style={{ color: 'var(--admin-muted)', fontSize: 13.5, lineHeight: 1.6, marginBottom: 20 }}>Toàn bộ dữ liệu hiện tại sẽ bị <strong style={{ color: '#ef4444' }}>xóa và ghi đè</strong> bằng dữ liệu trong tệp sao lưu. Không thể hoàn tác. Bạn chắc chắn?</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmImport(false)} style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>Hủy</button>
              <button onClick={triggerImport} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>Xóa & Khôi phục</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminShell>
  );
}
