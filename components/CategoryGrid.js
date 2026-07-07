'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Editable } from '@/components/LiveEditor';

const BROWN = '#ef7d9c';
const ESPRESSO = '#4a2a38';

function SectionHead({ icon, title, href = '/products', k }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 21, fontWeight: 900, color: ESPRESSO, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
        <span style={{ color: BROWN }}>{icon}</span>{k ? <Editable k={k} def={title} as="span" /> : title}
      </h2>
      <Link href={href} style={{ fontSize: 12.5, fontWeight: 700, color: BROWN, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
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
    { name: 'Phụ kiện thời trang', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=200&q=80', slug: 'phu-kien-thoi-trang' },
    { name: 'Móc khóa', image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=200&q=80', slug: 'moc-khoa' },
    { name: 'Văn phòng phẩm', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=200&q=80', slug: 'van-phong-pham' },
    { name: 'Đồ công nghệ', image: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=200&q=80', slug: 'do-cong-nghe' },
    { name: 'Trang trí', image: 'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?auto=format&fit=crop&w=200&q=80', slug: 'trang-tri' },
    { name: 'Quà tặng', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=200&q=80', slug: 'qua-tang' },
    { name: 'Combo ưu đãi', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=200&q=80', slug: 'combo-uu-dai' },
  ];

  // Ảnh danh mục theo vị trí (đồng bộ với seed)
  const designImages = [
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=200&q=80',
  ];

  useEffect(() => {
    fetch('/api/shop-categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories && data.categories.length > 0) {
          const active = data.categories.filter(c => c.is_active !== 0);
          // Always use our design images by index - never use API lifestyle photos
          setCategories(active.map((c, i) => ({
            ...c,
            image: designImages[i] || designImages[0],
          })));
        }
        else setCategories(fallbackCategories);
      })
      .catch(() => setCategories(fallbackCategories));
  }, []);

  return (
    <section style={{ backgroundColor: '#fff', padding: '48px 0' }}>
      <div className="container mx-auto px-4">
        <SectionHead icon="▦" title="Danh mục sản phẩm" href="/products" k="sec_categories" />
        <div className="cf-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 16 }}>
          {categories.map((cat, idx) => (
            <Link key={idx} href={`/products?cat=${cat.slug}`} className="cf-cat-item"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', padding: '20px 8px', borderRadius: 12, border: '1px solid #fceaf0', backgroundColor: '#fff', transition: 'all 0.25s' }}>
              <div style={{ width: 84, height: 84, overflow: 'hidden', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=200&q=80'; }} />
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#8a6472', lineHeight: 1.4 }}>{cat.name}</div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        .cf-cat-item:hover { box-shadow: 0 12px 26px rgba(59,42,32,0.1); transform: translateY(-4px); border-color: #f8d7e0; }
        @media (max-width: 1024px) { .cf-cat-grid { grid-template-columns: repeat(4, minmax(0,1fr)) !important; } }
        @media (max-width: 600px) { .cf-cat-grid { grid-template-columns: repeat(3, minmax(0,1fr)) !important; } }
      `}</style>
    </section>
  );
}
