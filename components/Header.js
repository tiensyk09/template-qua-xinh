'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { Editable, useLive } from '@/components/LiveEditor';

const PINK = '#ef7d9c';
const PINK_DARK = '#d1567a';
const ESPRESSO = '#4a2a38';
const GOLD = '#e07fa0';
const TEXT = '#8a6472';

const IconBean = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="21" fill={PINK} />
    <rect x="15" y="22" width="18" height="13" rx="1.5" fill="#fdeff4" />
    <rect x="13.5" y="18.5" width="21" height="5" rx="1.2" fill="#fff0f5" />
    <path d="M24 18.5v16.5" stroke={PINK} strokeWidth="1.8" />
    <path d="M24 18.5c-2.6-4.5-8-2.5-6 1M24 18.5c2.6-4.5 8-2.5 6 1" stroke="#fff0f5" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
);

const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1 7.7 7.7 7.7-7.7 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>
  </svg>
);

export default function Header() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProdOpen, setIsProdOpen] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { totalItems } = useCart();
  const { get, setField, editing } = useLive();
  const noNav = (e) => { if (editing) e.preventDefault(); };
  const brandLogo = get('brand_logo_img', '');

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/login');
        if (res.ok) { const data = await res.json(); if (data.user) setUser(data.user); }
      } catch (err) { /* ignore */ }
    })();
  }, []);

  const handleLogout = async () => {
    try { const res = await fetch('/api/auth/login', { method: 'DELETE' }); if (res.ok) { setUser(null); window.location.reload(); } } catch (err) {}
  };

  const productCats = [
    { title: 'Phụ kiện thời trang', link: '/products?cat=phu-kien-thoi-trang' },
    { title: 'Móc khóa', link: '/products?cat=moc-khoa' },
    { title: 'Văn phòng phẩm', link: '/products?cat=van-phong-pham' },
    { title: 'Đồ công nghệ', link: '/products?cat=do-cong-nghe' },
    { title: 'Trang trí', link: '/products?cat=trang-tri' },
    { title: 'Quà tặng', link: '/products?cat=qua-tang' },
    { title: 'Combo ưu đãi', link: '/products?cat=combo-uu-dai' },
  ];

  const giftOccasions = [
    { title: 'Quà sinh nhật', link: '/products?occ=sinh-nhat' },
    { title: 'Quà tốt nghiệp', link: '/products?occ=tot-nghiep' },
    { title: 'Quà Valentine', link: '/products?occ=valentine' },
    { title: 'Quà Noel', link: '/products?occ=noel' },
    { title: 'Quà 8/3', link: '/products?occ=8-3' },
    { title: 'Quà cưới', link: '/products?occ=cuoi' },
  ];

  const navItems = [
    { href: '/', label: 'Trang chủ' },
    { href: '/products', label: 'Sản phẩm', hasDropdown: true, items: productCats },
    { href: '/products', label: 'Bộ sưu tập' },
    { href: '/products', label: 'Quà tặng theo dịp', hasDropdown2: true, items: giftOccasions },
    { href: '/blog', label: 'Tin tức' },
    { href: '/contact', label: 'Liên hệ' },
  ];
  const activeIndex = navItems.findIndex((it) => it.href === '/' ? pathname === '/' : pathname?.startsWith(it.href));

  return (
    <header style={{ width: '100%', fontFamily: "'Be Vietnam Pro', Inter, sans-serif" }}>
      {/* TOP BAR */}
      <div className="cf-top-bar" style={{ backgroundColor: '#ff6b9d', color: '#fff', fontSize: 12, padding: '7px 16px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 500 }}>
            🎁 Miễn phí vận chuyển cho đơn từ <strong style={{ marginLeft: 3 }}>299k</strong>
          </span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
              📞 Hotline: <Editable k="contact_phone" def="0123 456 789" as="strong" style={{ marginLeft: 4 }} />
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
              ✉️ Email: <Editable k="contact_email" def="support@quatangxinh.vn" as="strong" style={{ marginLeft: 4 }} />
            </span>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div style={{ backgroundColor: '#fff', padding: '12px 16px', borderBottom: '1px solid #fce8f0', boxShadow: '0 2px 10px rgba(239,125,156,0.08)' }}>
        <div className="cf-header-row" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Logo */}
          <Link href="/" onClick={noNav} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              {brandLogo ? <img src={brandLogo} alt="logo" style={{ height: 44, width: 'auto', objectFit: 'contain' }} /> : <IconBean size={42} />}
              {editing && (
                <button onClick={(e) => { e.preventDefault(); const v = prompt('URL ảnh logo (để trống = dùng icon mặc định):', brandLogo || ''); if (v != null) setField('brand_logo_img', v.trim()); }}
                  style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.72)', color: '#fff', border: 'none', borderRadius: 5, padding: '2px 6px', fontSize: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>🖼 logo</button>
              )}
            </span>
            <div style={{ lineHeight: 1 }}>
              <Editable k="brand_name1" def="Quà Xinh" as="div" style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.01em', color: ESPRESSO }} />
              <Editable k="brand_name2" def="Phụ kiện & Quà tặng" as="div" style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em', color: GOLD, marginTop: 3, textTransform: 'uppercase' }} />
            </div>
          </Link>

          {/* Search */}
          <div className="cf-search" style={{ flex: 1, maxWidth: 520 }}>
            <form onSubmit={(e) => e.preventDefault()} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text" placeholder="Tìm kiếm sản phẩm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 48px 10px 18px', borderRadius: 8, border: '1.5px solid #f0c4d4', fontSize: 13, backgroundColor: '#fef6f9', outline: 'none', fontFamily: 'inherit' }}
              />
              <button type="submit" aria-label="Tìm"
                style={{ position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: '#ef7d9c', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, borderRadius: '0 8px 8px 0' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="cf-actions" style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: TEXT }}>
                <span style={{ fontSize: 20 }}>👤</span>
                <div style={{ lineHeight: 1.25 }}>
                  <div style={{ fontSize: 10, color: '#b39aa4' }}>Chào, {user.displayName || user.username}</div>
                  <div style={{ fontSize: 11, display: 'flex', gap: 6 }}>
                    <Link href="/orders" style={{ color: PINK, fontWeight: 700, textDecoration: 'none' }}>Đơn hàng</Link>
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: 0, color: '#c0392b', fontWeight: 700, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>Thoát</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="cf-account" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: TEXT }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <div style={{ lineHeight: 1.25 }}>
                  <div style={{ fontSize: 10, color: '#b39aa4' }}>Tài khoản</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: ESPRESSO }}>Đăng nhập</div>
                </div>
              </Link>
            )}

            {/* Wishlist */}
            <Link href="/wishlist" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: TEXT, position: 'relative' }}>
              <HeartIcon />
              <span style={{ fontSize: 10, color: '#b39aa4' }}>Yêu thích</span>
            </Link>

            {/* Cart */}
            <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: TEXT }}>
              <div style={{ position: 'relative' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6l1.6-8.4H6"/>
                </svg>
                <span style={{ position: 'absolute', top: -7, right: -8, backgroundColor: PINK, color: '#fff', fontSize: 9, fontWeight: 800, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalItems}</span>
              </div>
              <div className="cf-cart-text" style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: 10, color: '#b39aa4' }}>Giỏ hàng</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: ESPRESSO }}>{totalItems}đ</div>
              </div>
            </Link>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="cf-mobile-toggle" aria-label="Menu"
              style={{ display: 'none', padding: 8, border: '1px solid #f8dbe4', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 18, color: ESPRESSO }}>
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* NAV BAR */}
      <div className="cf-nav" style={{ backgroundColor: '#fff', borderBottom: '1px solid #fbe4ec', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 2px 10px rgba(59,42,32,0.05)' }}>
        <nav style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 0, padding: '0 16px' }}>
          {/* Danh mục sản phẩm button */}
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setIsCatOpen(true)}
            onMouseLeave={() => setIsCatOpen(false)}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#ef7d9c', color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.02em', padding: '12px 18px', border: 'none', cursor: 'pointer', marginRight: 20 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              Danh mục sản phẩm
            </button>
            {isCatOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, width: 260, backgroundColor: '#fff', border: '1px solid #fbe4ec', borderRadius: '0 0 12px 12px', boxShadow: '0 16px 36px rgba(59,42,32,0.16)', zIndex: 100, overflow: 'hidden' }}>
                {productCats.map((c, i) => (
                  <Link key={i} href={c.link} onClick={() => setIsCatOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, fontWeight: 600, color: TEXT, borderBottom: i < productCats.length - 1 ? '1px solid #fef4f7' : 'none', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f6'; e.currentTarget.style.color = PINK; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = TEXT; }}>
                    <span style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: GOLD }} />{c.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navItems.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div key={item.label + idx} style={{ position: 'relative' }}
                onMouseEnter={() => { if (item.hasDropdown) setIsProdOpen(true); if (item.hasDropdown2) setIsGiftOpen(true); }}
                onMouseLeave={() => { if (item.hasDropdown) setIsProdOpen(false); if (item.hasDropdown2) setIsGiftOpen(false); }}>
                <Link href={item.href}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, letterSpacing: '0.01em', color: isActive ? PINK : '#6a4453', textDecoration: 'none', padding: '13px 14px', borderBottom: isActive ? `2.5px solid ${PINK}` : '2.5px solid transparent', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = PINK; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? PINK : '#6a4453'; }}>
                  {item.label}
                  {(item.hasDropdown || item.hasDropdown2) && <svg width="9" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1 L5 5 L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </Link>
                {item.hasDropdown && isProdOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 250, backgroundColor: '#fff', border: '1px solid #fbe4ec', borderRadius: 12, boxShadow: '0 16px 36px rgba(59,42,32,0.16)', zIndex: 100, overflow: 'hidden' }}>
                    {productCats.map((c, i) => (
                      <Link key={i} href={c.link} onClick={() => setIsProdOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, fontWeight: 600, color: TEXT, borderBottom: i < productCats.length - 1 ? '1px solid #fef4f7' : 'none', textDecoration: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f6'; e.currentTarget.style.color = PINK; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = TEXT; }}>
                        <span style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: GOLD }} />{c.title}
                      </Link>
                    ))}
                  </div>
                )}
                {item.hasDropdown2 && isGiftOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 250, backgroundColor: '#fff', border: '1px solid #fbe4ec', borderRadius: 12, boxShadow: '0 16px 36px rgba(59,42,32,0.16)', zIndex: 100, overflow: 'hidden' }}>
                    {giftOccasions.map((c, i) => (
                      <Link key={i} href={c.link} onClick={() => setIsGiftOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, fontWeight: 600, color: TEXT, borderBottom: i < giftOccasions.length - 1 ? '1px solid #fef4f7' : 'none', textDecoration: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f6'; e.currentTarget.style.color = PINK; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = TEXT; }}>
                        <span style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: GOLD }} />{c.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #fbe4ec', padding: 16 }}>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            {navItems.map((item, idx) => (
              <Link key={item.label + idx} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: '12px 0', fontSize: 14, fontWeight: 700, color: '#6a4453', borderBottom: '1px solid #fef4f7', textDecoration: 'none' }}>{item.label}</Link>
            ))}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: PINK, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.06em' }}>Danh mục sản phẩm</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {productCats.map((c, i) => (
                  <Link key={i} href={c.link} onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: 12.5, color: '#8a6472', textDecoration: 'none', padding: '6px 0', fontWeight: 500 }}>{c.title}</Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .cf-top-bar { display: none !important; }
          .cf-nav { display: none !important; }
          .cf-mobile-toggle { display: block !important; }
          .cf-header-row { flex-wrap: wrap !important; gap: 12px !important; }
          .cf-search { order: 3; width: 100% !important; max-width: 100% !important; flex: none !important; }
          .cf-account > div, .cf-cart-text { display: none !important; }
        }
      `}</style>
    </header>
  );
}
