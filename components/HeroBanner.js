'use client';
import React from 'react';
import Link from 'next/link';
import { Editable, EditableImg, useLive } from '@/components/LiveEditor';

const PINK = '#ef7d9c';
const PINK_DARK = '#d1567a';
const ESPRESSO = '#4a2a38';
const BTN = '#e86e8e';
const TEXT = '#8a6472';

export default function HeroBanner() {
  const { editing } = useLive();
  const noNav = (e) => { if (editing) e.preventDefault(); };
  return (
    <section style={{ position: 'relative', background: 'linear-gradient(135deg, #fff0f5 0%, #fde8f0 40%, #fbd5e8 100%)', overflow: 'hidden', borderRadius: 16, margin: '16px', minHeight: 340 }}>
      {/* Decorative hearts */}
      <div style={{ position: 'absolute', top: 20, left: 30, fontSize: 18, color: '#f4a5c0', opacity: 0.6, pointerEvents: 'none' }}>♡</div>
      <div style={{ position: 'absolute', top: 60, left: 80, fontSize: 12, color: '#f4a5c0', opacity: 0.4, pointerEvents: 'none' }}>♡</div>
      <div style={{ position: 'absolute', bottom: 60, left: 50, fontSize: 22, color: '#f4a5c0', opacity: 0.5, pointerEvents: 'none' }}>♡</div>
      <div style={{ position: 'absolute', top: 30, right: 320, fontSize: 14, color: '#f4a5c0', opacity: 0.5, pointerEvents: 'none' }}>✦</div>
      <div style={{ position: 'absolute', bottom: 40, left: 250, fontSize: 10, color: '#f4a5c0', opacity: 0.5, pointerEvents: 'none' }}>✦</div>

      <div className="cf-hero-wrap" style={{ display: 'flex', alignItems: 'center', minHeight: 340, position: 'relative' }}>
        {/* LEFT: Text content */}
        <div className="cf-hero-text" style={{ flex: '0 1 52%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 500, width: '100%', padding: '40px 32px 40px 40px' }}>
            <h1 className="cf-hero-title" style={{ fontSize: 38, fontWeight: 900, color: ESPRESSO, lineHeight: 1.2, letterSpacing: '-0.3px', marginBottom: 14 }}>
              <Editable k="hero_title1" def="Món phụ kiện nhỏ" as="span" /><br />
              <span style={{ fontStyle: 'italic', color: PINK }}>
                <Editable k="hero_title2" def="Gửi trọn yêu thương" as="span" />
              </span>
              <span style={{ marginLeft: 8, fontSize: 28 }}>♡</span>
            </h1>
            <p style={{ fontSize: 14, color: TEXT, fontWeight: 400, lineHeight: 1.7, marginBottom: 28, maxWidth: 400 }}>
              <Editable k="hero_desc" def="Khám phá hàng ngàn món quà xinh xắn cho những người bạn yêu quý" as="span" multiline />
            </p>

            <Link href="/products" onClick={noNav}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: BTN, color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 999, textDecoration: 'none', boxShadow: '0 6px 20px rgba(232,110,142,0.40)', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.backgroundColor = PINK_DARK; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = BTN; }}>
              <Editable k="hero_btn1" def="Mua sắm ngay" as="span" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
        </div>

        {/* RIGHT: Product image */}
        <div className="cf-hero-img" style={{ flex: '0 1 48%', position: 'relative', overflow: 'hidden', minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EditableImg fill k="hero_img" def="/images/hero-banner.png"
            alt="Quà tặng & phụ kiện xinh xắn"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=85';
            }}
          />
          {/* Fade left edge */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(to right, #fde8f0 0%, rgba(253,232,240,0.5) 20%, transparent 50%)'
          }} />
        </div>
      </div>

      <style>{`
        .cf-hero-wrap { min-height: 340px; }
        @media (max-width: 900px) {
          .cf-hero-wrap { flex-direction: column !important; }
          .cf-hero-text { flex: none !important; justify-content: flex-start !important; }
          .cf-hero-text > div { padding: 32px 20px 16px !important; }
          .cf-hero-title { font-size: 28px !important; }
          .cf-hero-img { flex: none !important; width: 100% !important; height: 240px !important; min-height: 240px !important; }
        }
      `}</style>
    </section>
  );
}
