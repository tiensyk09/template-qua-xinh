'use client';
import React, { useState } from 'react';
import { Editable } from '@/components/LiveEditor';

const BROWN = '#ef7d9c';
const ESPRESSO = '#4a2a38';

export default function BrandNewsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    try {
      await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Đăng ký nhận tin', email, message: 'Đăng ký nhận tin từ Quà Xinh' }) });
    } catch {}
    setStatus('done'); setEmail('');
  };

  return (
    <section style={{ padding: '20px 0 52px' }}>
      <div className="container mx-auto px-4">
        <div className="cf-news" style={{ background: 'linear-gradient(100deg, #fde4ea 0%, #fce8ec 100%)', borderRadius: 20, padding: '30px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap', border: '1px solid #f8d7e0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: '1 1 46%', minWidth: 300 }}>
            <span style={{ width: 60, height: 60, borderRadius: 999, backgroundColor: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(239,125,156,0.25)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="m3 7 9 6 9-6"/></svg>
            </span>
            <div style={{ maxWidth: 460 }}>
              <Editable k="news_title" def="Đăng ký nhận tin" as="h3" style={{ fontSize: 22, fontWeight: 900, color: ESPRESSO, marginBottom: 6, letterSpacing: '0.01em' }} />
              <Editable k="news_desc" def="Nhận ngay ưu đãi độc quyền và cập nhật sản phẩm mới nhất!" as="p" multiline style={{ fontSize: 13.5, color: '#8a6472', fontWeight: 500, lineHeight: 1.5 }} />
            </div>
          </div>
          <form onSubmit={subscribe} style={{ display: 'flex', gap: 10, flex: '1 1 40%', minWidth: 280, maxWidth: 520 }}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email của bạn..."
              style={{ flex: 1, padding: '13px 18px', borderRadius: 999, border: '1.5px solid #f4b9c8', fontSize: 13, outline: 'none', backgroundColor: '#fff', color: ESPRESSO }} />
            <button type="submit" disabled={status === 'sending'}
              style={{ background: 'linear-gradient(135deg, #f5889e, #ef7d9c)', color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '0.02em', padding: '13px 30px', border: 'none', borderRadius: 999, cursor: 'pointer', flexShrink: 0, boxShadow: '0 6px 16px rgba(239,125,156,0.3)' }}>
              {status === 'done' ? '✓ Đã đăng ký' : 'Đăng ký'}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) { .cf-news { flex-direction: column; align-items: flex-start !important; } }
      `}</style>
    </section>
  );
}
