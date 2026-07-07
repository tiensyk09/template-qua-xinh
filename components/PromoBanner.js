'use client';
import React from 'react';
import Link from 'next/link';
import { Editable, useLive } from '@/components/LiveEditor';

const PINK = '#ef7d9c';
const PINK_DARK = '#d1567a';
const ESPRESSO = '#4a2a38';

const features = [
  { icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h13v13H1zM14 8h5l3 3v5h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>), title: 'Miễn phí vận chuyển', desc: 'Cho đơn từ 299k' },
  { icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>), title: 'Đổi trả dễ dàng', desc: 'Trong 7 ngày' },
  { icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>), title: 'Thanh toán an toàn', desc: 'Bảo mật thông tin' },
  { icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>), title: 'Tư vấn tận tâm', desc: 'Hỗ trợ 24/7' },
];

const banners = [
  { bg: 'linear-gradient(135deg, #ffe0ed 0%, #ffc6da 100%)', accentColor: '#e8427a', title: 'Combo quà xinh\nGiá chỉ từ 199k', cta: 'Mua ngay', type: 'button', emoji: '🎁', image: '/images/promo-combo.png' },
  { bg: 'linear-gradient(135deg, #ede0ff 0%, #d6c4ff 100%)', accentColor: '#7c3aed', title: 'Quà tặng sinh nhật\nNgọt ngào & ý nghĩa', cta: 'Khám phá ngay', type: 'link', emoji: '🎂', image: '/images/promo-birthday.png' },
  { bg: 'linear-gradient(135deg, #fff8e0 0%, #ffedb0 100%)', accentColor: '#b45309', title: 'Ưu đãi thành viên\nGiảm ngay 10%', cta: 'Đăng ký ngay', type: 'link', emoji: '⭐', image: null },
];

export default function PromoBanner() {
  const { get, setField, editing } = useLive();
  const noNav = (e) => { if (editing) e.preventDefault(); };
  return (
    <>
      {/* FEATURE STRIP - white background with icons */}
      <section style={{ backgroundColor: '#fff', padding: '24px 0', borderTop: '1px solid #fce8f0', borderBottom: '1px solid #fce8f0' }}>
        <div className="container mx-auto px-4">
          <div className="cf-feat-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRight: i < 3 ? '1px solid #fce8f0' : 'none' }}>
                <span style={{ width: 50, height: 50, borderRadius: 999, backgroundColor: '#fff5f8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <Editable k={`feat${i}_title`} def={f.title} as="div" style={{ fontSize: 13, fontWeight: 700, color: ESPRESSO, marginBottom: 3 }} />
                  <Editable k={`feat${i}_desc`} def={f.desc} as="div" style={{ fontSize: 11.5, color: '#b39aa4', fontWeight: 500, lineHeight: 1.4 }} multiline />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 PROMO BANNERS */}
      <section style={{ backgroundColor: '#fff', padding: '32px 0' }}>
        <div className="container mx-auto px-4">
          <div className="cf-promo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {banners.map((b, i) => {
              const img = get(`promo${i}_img`, b.image);
              return (
                <div key={i} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', minHeight: 160, display: 'flex', alignItems: 'center', padding: '22px 24px', background: b.bg }}>
                  {img && (
                    <img src={img} alt={b.title} style={{ position: 'absolute', right: 0, bottom: 0, height: '100%', width: '45%', objectFit: 'cover', objectPosition: 'left top', opacity: 0.25 }}
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                  {/* Emoji decoration */}
                  <div style={{ position: 'absolute', right: 20, top: 16, fontSize: 40, opacity: 0.4 }}>{b.emoji}</div>
                  {editing && (
                    <button onClick={() => { const v = prompt('URL ảnh nền banner:', img || ''); if (v != null) setField(`promo${i}_img`, v.trim()); }}
                      style={{ position: 'absolute', top: 8, right: 8, zIndex: 5, background: 'rgba(0,0,0,0.72)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>🖼 Ảnh nền</button>
                  )}
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <Editable k={`promo${i}_title`} def={b.title} as="h3" multiline style={{ fontSize: 16, fontWeight: 800, color: b.accentColor, lineHeight: 1.35, letterSpacing: '0.01em', marginBottom: 14, whiteSpace: 'pre-line' }} />
                    {b.type === 'button' ? (
                      <Link href="/products" onClick={noNav}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: b.accentColor, color: '#fff', fontWeight: 700, fontSize: 12, padding: '9px 20px', borderRadius: 999, textDecoration: 'none', boxShadow: `0 4px 12px ${b.accentColor}44` }}>
                        <Editable k={`promo${i}_cta`} def={b.cta} as="span" />
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
                      </Link>
                    ) : (
                      <Link href="/products" onClick={noNav}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: b.accentColor, fontWeight: 700, fontSize: 12, textDecoration: 'none', padding: '9px 0' }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>
                        <Editable k={`promo${i}_cta`} def={b.cta} as="span" /> →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) { .cf-feat-strip { grid-template-columns: repeat(2, 1fr) !important; } .cf-feat-strip > div { border-right: none !important; } .cf-promo-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .cf-feat-strip { grid-template-columns: 1fr 1fr !important; } .cf-promo-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
