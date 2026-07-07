'use client';
import React from 'react';
import Link from 'next/link';
import { SocialIcon, buildSocialLinks } from '@/components/SocialLinks';
import { Editable } from '@/components/LiveEditor';

const GOLD = '#f0b3c5';
const CREAM = '#e9ddca';
const MUTED = '#b3a692';
const PINK = '#ef7d9c';

const IconBean = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="21" fill="#7a3a4e" />
    <rect x="15" y="22" width="18" height="13" rx="1.5" fill="#fff0f5" />
    <rect x="13.5" y="18.5" width="21" height="5" rx="1.2" fill={GOLD} />
    <path d="M24 18.5v16.5" stroke="#7a3a4e" strokeWidth="1.6" />
  </svg>
);

export default function Footer() {
  const [socialLinks, setSocialLinks] = React.useState([]);
  React.useEffect(() => {
    fetch('/api/settings').then((r) => r.ok ? r.json() : null).then((d) => { if (d?.settings) setSocialLinks(buildSocialLinks(d.settings)); }).catch(() => {});
  }, []);

  const defaultSocials = [
    { key: 'facebook', url: '#', label: 'Facebook' },
    { key: 'instagram', url: '#', label: 'Instagram' },
    { key: 'tiktok', url: '#', label: 'TikTok' },
    { key: 'youtube', url: '#', label: 'YouTube' },
  ];
  const activeSocials = socialLinks.length > 0 ? socialLinks : defaultSocials;

  const about = ['Giới thiệu', 'Chính sách bảo mật', 'Điều khoản sử dụng', 'Chính sách đổi trả', 'Hướng dẫn mua hàng'];
  const support = ['Câu hỏi thường gặp', 'Hướng dẫn thanh toán', 'Hướng dẫn vận chuyển', 'Kiểm tra đơn hàng', 'Liên hệ hỗ trợ'];

  const linkStyle = { fontSize: 13, color: MUTED, textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s', display: 'block', padding: '4px 0' };
  const colTitle = { fontSize: 13, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 };
  const hIn = (e) => { e.currentTarget.style.color = GOLD; };
  const hOut = (e) => { e.currentTarget.style.color = MUTED; };

  return (
    <>
      <footer style={{ backgroundColor: '#4a2a38', color: CREAM, fontFamily: "'Be Vietnam Pro', Inter, sans-serif", paddingTop: 48, paddingBottom: 22 }}>
        <div className="container mx-auto px-4">
          <div className="cf-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.4fr', gap: 30, marginBottom: 32 }}>
            {/* Brand */}
            <div>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 14 }}>
                <IconBean size={38} />
                <div style={{ lineHeight: 1 }}>
                  <Editable k="brand_name1" def="Quà Xinh" as="div" style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '0.02em' }} />
                  <Editable k="brand_name2" def="Phụ kiện & Quà tặng" as="div" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: GOLD, marginTop: 3, textTransform: 'uppercase' }} />
                </div>
              </Link>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: MUTED, fontWeight: 500, marginBottom: 18, maxWidth: 280 }}>
                <Editable k="footer_about" def="Quà Xinh mang đến những món phụ kiện và quà tặng xinh xắn, ý nghĩa cho bạn và những người thân yêu." as="span" multiline />
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {activeSocials.map((s) => (
                  <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = PINK; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}>
                    <SocialIcon platform={s.key} size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Về chúng tôi */}
            <div>
              <h3 style={colTitle}>Về chúng tôi</h3>
              {about.map((c, i) => (<Link key={i} href="/contact" style={linkStyle} onMouseEnter={hIn} onMouseLeave={hOut}>{c}</Link>))}
            </div>

            {/* Hỗ trợ */}
            <div>
              <h3 style={colTitle}>Hỗ trợ khách hàng</h3>
              {support.map((c, i) => (<Link key={i} href="/contact" style={linkStyle} onMouseEnter={hIn} onMouseLeave={hOut}>{c}</Link>))}
            </div>

            {/* Liên hệ */}
            <div>
              <h3 style={colTitle}>Thông tin liên hệ</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, fontWeight: 500, color: MUTED }}>
                <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                  <Editable k="contact_address" def={"123 Đường ABC, Quận 1,\nTP. Hồ Chí Minh"} as="span" multiline />
                </li>
                <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={GOLD} style={{ flexShrink: 0 }}><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.2 1L6.6 10.8z"/></svg>
                  <Editable k="contact_phone" def="0123 456 789" as="span" style={{ color: '#fff', fontWeight: 800 }} />
                </li>
                <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" style={{ flexShrink: 0 }}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                  <Editable k="contact_email" def="support@quatangxinh.vn" as="span" />
                </li>
                <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                  <Editable k="contact_hours" def="8:00 - 21:00 (T2 - CN)" as="span" />
                </li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 12.5, color: MUTED, fontWeight: 500 }}>
            <Editable k="footer_copyright" def="© 2024 Quà Xinh. All rights reserved." as="div" style={{ color: CREAM }} />
            <div style={{ display: 'flex', gap: 8 }}>
              {['VISA', 'MasterCard', 'MoMo', 'ZaloPay'].map((p) => (
                <span key={p} style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, color: CREAM }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating live chat button */}
      <button aria-label="Chat hỗ trợ"
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, width: 52, height: 52, borderRadius: 999, backgroundColor: PINK, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(239,125,156,0.5)', transition: 'all 0.25s' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      <style>{`
        @media (max-width: 1024px) { .cf-footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .cf-footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
