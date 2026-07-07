'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { SectionHead } from '@/components/CategoryGrid';

const BROWN = '#ef7d9c';
const BROWN_DARK = '#d1567a';
const ESPRESSO = '#4a2a38';
const GOLD = '#e07fa0';
const RED = '#c0392b';

const Star = ({ f }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={f ? '#e8a838' : '#e0d6c6'}><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.9 6.9-1L12 2z"/></svg>
);

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState(null);

  const fallbackProducts = [
    { id: 1, name: 'Móc khóa dây beaded nhiều màu', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=600&q=80', badge: '-10%', badgeType: 'discount', rating: 5, reviews: 124, price: 89000, original_price: 99000, slug: 'moc-khoa-day-beaded-nhieu-mau' },
    { id: 2, name: 'Đèn ngủ gấu cute', image: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=600&q=80', badge: 'MỚI', badgeType: 'new', rating: 5, reviews: 98, price: 149000, original_price: null, slug: 'den-ngu-gau-cute' },
    { id: 3, name: 'Set kẹp tóc nơ xinh xắn', image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80', badge: 'HOT', badgeType: 'best', rating: 5, reviews: 76, price: 59000, original_price: null, slug: 'set-kep-toc-no-xinh-xan' },
    { id: 4, name: 'Ly giữ nhiệt Good Day 500ml', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80', badge: 'Bán chạy', badgeType: 'best', rating: 5, reviews: 201, price: 139000, original_price: null, slug: 'ly-giu-nhiet-good-day-500ml' },
  ];

  // Ảnh sản phẩm dự phòng theo vị trí (khi API chưa có ảnh)
  const designProductImages = [
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
  ];

  useEffect(() => {
    fetch('/api/products?limit=8')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products.map((p, i) => ({
            id: p.id,
            name: p.name,
            // Ưu tiên ảnh thật từ API (seed Unsplash), nếu thiếu mới dùng ảnh dự phòng
            image: p.thumbnail || designProductImages[i % 4],
            price: p.price,
            original_price: p.original_price,
            slug: p.slug,
            reviews: [128, 86, 64, 42, 55, 37, 91, 24][i % 8],
            unit: p.unit,
            badge: fallbackProducts[i % 4].badge,
            badgeType: fallbackProducts[i % 4].badgeType,
          })));
        } else setProducts(fallbackProducts);
      })
      .catch(() => setProducts(fallbackProducts));
  }, []);

  const handleAddToCart = (e, prod) => {
    e.preventDefault(); e.stopPropagation();
    setAddingId(prod.id);
    addItem({ id: prod.id, name: prod.name, price: prod.price, thumbnail: prod.image, unit: prod.unit || 'Cái' }, null, 1);
    setTimeout(() => setAddingId(null), 900);
  };

  const badgeColor = { discount: RED, new: '#4b7a3e', best: '#d18b2a' };

  const Arrow = ({ dir }) => (
    <button aria-label={dir} className="cf-prod-arrow" style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: '#fff', border: '1px solid #fbe4ec', color: BROWN, fontSize: 18, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,42,32,0.1)', flexShrink: 0 }}>
      {dir === 'left' ? '‹' : '›'}
    </button>
  );

  return (
    <section id="featured-products" style={{ backgroundColor: '#fef6f9', padding: '48px 0' }}>
      <div className="container mx-auto px-4">
        <SectionHead icon="🔥" title="Sản phẩm bán chạy" href="/products" k="sec_products" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="cf-prod-arrow-wrap"><Arrow dir="left" /></div>
          <div className="cf-prod-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20 }}>
            {products.slice(0, 4).map((prod) => {
              const hasDiscount = prod.original_price && prod.original_price > prod.price;
              return (
                <div key={prod.id} className="cf-prod-card" style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #fce7ee', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s', position: 'relative' }}>
                  {prod.badge && (
                    <span style={{ position: 'absolute', top: 12, left: 12, zIndex: 3, backgroundColor: badgeColor[prod.badgeType] || RED, color: '#fff', fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{prod.badge}</span>
                  )}
                  <Link href={`/products/${prod.slug}`} style={{ display: 'block', height: 180, backgroundColor: '#fff', padding: '16px', overflow: 'hidden' }}>
                    <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.5s' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'; }} />
                  </Link>
                  <div style={{ padding: '16px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Link href={`/products/${prod.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: 13.5, fontWeight: 700, color: ESPRESSO, lineHeight: 1.4, marginBottom: 8, minHeight: 38 }}>{prod.name}</h3>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                      <span style={{ display: 'inline-flex', gap: 1 }}>{[0,1,2,3,4].map(i => <Star key={i} f />)}</span>
                      <span style={{ fontSize: 11, color: '#b39aa4', fontWeight: 500 }}>({prod.reviews})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 17, fontWeight: 900, color: hasDiscount ? RED : ESPRESSO }}>{prod.price.toLocaleString('vi-VN')}đ</span>
                      {hasDiscount && <span style={{ fontSize: 12, color: '#b0a595', textDecoration: 'line-through', fontWeight: 500 }}>{prod.original_price.toLocaleString('vi-VN')}đ</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <button onClick={(e) => handleAddToCart(e, prod)} disabled={addingId === prod.id}
                        style={{ flex: 1, backgroundColor: addingId === prod.id ? '#4b7a3e' : BROWN, color: '#fff', fontWeight: 800, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '11px', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => { if (addingId !== prod.id) e.currentTarget.style.backgroundColor = BROWN_DARK; }}
                        onMouseLeave={(e) => { if (addingId !== prod.id) e.currentTarget.style.backgroundColor = BROWN; }}>
                        {addingId === prod.id ? '✓ ĐÃ THÊM' : 'THÊM VÀO GIỎ'}
                      </button>
                      <button aria-label="Yêu thích" style={{ width: 40, flexShrink: 0, backgroundColor: '#fef2f6', color: BROWN, border: '1px solid #fbe4ec', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20s-7-4.6-7-9.6A3.9 3.9 0 0 1 12 7a3.9 3.9 0 0 1 7 3.4C19 15.4 12 20 12 20Z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cf-prod-arrow-wrap"><Arrow dir="right" /></div>
        </div>
      </div>
      <style>{`
        .cf-prod-card:hover { box-shadow: 0 16px 34px rgba(59,42,32,0.13); transform: translateY(-4px); border-color: #f8d7e0; }
        .cf-prod-card:hover img { transform: scale(1.06); }
        @media (max-width: 1024px) { .cf-prod-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } .cf-prod-arrow-wrap { display: none !important; } }
        @media (max-width: 560px) { .cf-prod-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
