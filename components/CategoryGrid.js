'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Editable } from '@/components/LiveEditor';

const PINK = '#ef7d9c';
const ESPRESSO = '#4a2a38';

// Category icons as SVG
const catIcons = [
  // Phụ kiện thời trang - bow/ribbon
  <svg key="0" width="32" height="32" viewBox="0 0 32 32" fill="none"><ellipse cx="10" cy="16" rx="7" ry="5" fill="#f9c0d0" stroke="#ef7d9c" strokeWidth="1.5"/><ellipse cx="22" cy="16" rx="7" ry="5" fill="#f9c0d0" stroke="#ef7d9c" strokeWidth="1.5"/><circle cx="16" cy="16" r="3" fill="#ef7d9c"/></svg>,
  // Móc khóa - key
  <svg key="1" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="13" cy="13" r="7" stroke="#ef7d9c" strokeWidth="2" fill="#ffd6e7"/><path d="M18 18l8 8" stroke="#ef7d9c" strokeWidth="2.5" strokeLinecap="round"/><path d="M22 22l2-2" stroke="#ef7d9c" strokeWidth="2" strokeLinecap="round"/></svg>,
  // Văn phòng phẩm - notebook
  <svg key="2" width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="7" y="5" width="18" height="22" rx="2" fill="#ffd6e7" stroke="#ef7d9c" strokeWidth="1.5"/><path d="M11 11h10M11 16h10M11 21h6" stroke="#ef7d9c" strokeWidth="1.5" strokeLinecap="round"/><rect x="5" y="7" width="4" height="18" rx="1" fill="#ef7d9c" opacity="0.4"/></svg>,
  // Đồ công nghệ - phone
  <svg key="3" width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="10" y="3" width="12" height="26" rx="3" fill="#ffd6e7" stroke="#ef7d9c" strokeWidth="1.5"/><circle cx="16" cy="25" r="1.5" fill="#ef7d9c"/><rect x="13" y="6" width="6" height="2" rx="1" fill="#ef7d9c" opacity="0.5"/></svg>,
  // Trang trí - flower/plant
  <svg key="4" width="32" height="32" viewBox="0 0 32 32" fill="none"><ellipse cx="16" cy="10" rx="4" ry="6" fill="#ffd6e7" stroke="#ef7d9c" strokeWidth="1.2"/><ellipse cx="22" cy="14" rx="4" ry="6" transform="rotate(60 22 14)" fill="#ffd6e7" stroke="#ef7d9c" strokeWidth="1.2"/><ellipse cx="10" cy="14" rx="4" ry="6" transform="rotate(-60 10 14)" fill="#ffd6e7" stroke="#ef7d9c" strokeWidth="1.2"/><circle cx="16" cy="14" r="3" fill="#ef7d9c"/><path d="M16 17v9" stroke="#7ac074" strokeWidth="2" strokeLinecap="round"/></svg>,
  // Quà tặng - gift box
  <svg key="5" width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="15" width="20" height="13" rx="2" fill="#ffd6e7" stroke="#ef7d9c" strokeWidth="1.5"/><rect x="4" y="10" width="24" height="7" rx="2" fill="#f9c0d0" stroke="#ef7d9c" strokeWidth="1.5"/><path d="M16 10v18" stroke="#ef7d9c" strokeWidth="1.5"/><path d="M16 10c-3-5-9-3-7 1M16 10c3-5 9-3 7 1" stroke="#ef7d9c" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>,
  // Combo ưu đãi - stars/discount
  <svg key="6" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" fill="#ffd6e7" stroke="#ef7d9c" strokeWidth="1.5"/><text x="16" y="21" textAnchor="middle" fontSize="14" fill="#ef7d9c" fontWeight="900">%</text></svg>,
  // Xem tất cả - grid
  <svg key="7" width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="5" y="5" width="9" height="9" rx="2" fill="#ffd6e7" stroke="#ef7d9c" strokeWidth="1.5"/><rect x="18" y="5" width="9" height="9" rx="2" fill="#ffd6e7" stroke="#ef7d9c" strokeWidth="1.5"/><rect x="5" y="18" width="9" height="9" rx="2" fill="#ffd6e7" stroke="#ef7d9c" strokeWidth="1.5"/><rect x="18" y="18" width="9" height="9" rx="2" fill="#ffd6e7" stroke="#ef7d9c" strokeWidth="1.5"/></svg>,
];

function SectionHead({ title, href = '/products', k }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: ESPRESSO }}>
        {k ? <Editable k={k} def={title} as="span" /> : title}
      </h2>
      <Link href={href} style={{ fontSize: 13, fontWeight: 600, color: PINK, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        Xem tất cả
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12 H20 M14 6 L20 12 L14 18" /></svg>
      </Link>
    </div>
  );
}
export { SectionHead };

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);

  const fallbackCategories = [
    { name: 'Phụ kiện thời trang', slug: 'phu-kien-thoi-trang', iconIdx: 0 },
    { name: 'Móc khóa', slug: 'moc-khoa', iconIdx: 1 },
    { name: 'Văn phòng phẩm', slug: 'van-phong-pham', iconIdx: 2 },
    { name: 'Đồ công nghệ', slug: 'do-cong-nghe', iconIdx: 3 },
    { name: 'Trang trí', slug: 'trang-tri', iconIdx: 4 },
    { name: 'Quà tặng', slug: 'qua-tang', iconIdx: 5 },
    { name: 'Combo ưu đãi', slug: 'combo-uu-dai', iconIdx: 6 },
  ];

  useEffect(() => {
    fetch('/api/shop-categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories && data.categories.length > 0) {
          const active = data.categories.filter(c => c.is_active !== 0);
          setCategories(active.map((c, i) => ({ ...c, iconIdx: i % 7 })));
        } else setCategories(fallbackCategories);
      })
      .catch(() => setCategories(fallbackCategories));
  }, []);

  const allItems = [...categories, { name: 'Xem tất cả', slug: null, iconIdx: 7 }];

  return (
    <section style={{ backgroundColor: '#fff', padding: '28px 0 24px' }}>
      <div className="container mx-auto px-4">
        <div className="cf-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gap: 8 }}>
          {allItems.map((cat, idx) => (
            <Link key={idx}
              href={cat.slug ? `/products?cat=${cat.slug}` : '/products'}
              className="cf-cat-item"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', padding: '16px 8px 14px', borderRadius: 12, backgroundColor: '#fff', transition: 'all 0.25s' }}>
              <div style={{ width: 62, height: 62, borderRadius: 999, backgroundColor: '#fff5f8', border: '1.5px solid #fde4ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, flexShrink: 0 }}>
                {catIcons[cat.iconIdx] || catIcons[0]}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#6a4453', lineHeight: 1.35, maxWidth: 80 }}>{cat.name}</div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        .cf-cat-item:hover { background: #fff5f8 !important; }
        .cf-cat-item:hover > div:first-child { border-color: #ef7d9c !important; box-shadow: 0 6px 18px rgba(239,125,156,0.18); }
        @media (max-width: 1024px) { .cf-cat-grid { grid-template-columns: repeat(4, minmax(0,1fr)) !important; } }
        @media (max-width: 600px) { .cf-cat-grid { grid-template-columns: repeat(4, minmax(0,1fr)) !important; } }
      `}</style>
    </section>
  );
}
