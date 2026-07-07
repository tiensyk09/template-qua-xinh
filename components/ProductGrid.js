'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { SectionHead } from '@/components/CategoryGrid';

const PINK = '#ef7d9c';
const PINK_DARK = '#d1567a';
const ESPRESSO = '#4a2a38';
const GOLD = '#e07fa0';
const RED = '#e8427a';

const Star = ({ f }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={f ? '#f5a623' : '#e8d5d9'}><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.9 6.9-1L12 2z"/></svg>
);

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6l1.6-8.4H6"/>
  </svg>
);

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState(null);

  const fallbackProducts = [
    { id: 1, name: 'Móc khóa dây beaded nhiều màu', image: 'https://placehold.co/600x600/fce4ec/d1567a?text=Moc%20khoa%20beaded', badge: '-10%', badgeType: 'discount', rating: 5, reviews: 124, price: 89000, original_price: 99000, slug: 'moc-khoa-day-beaded-nhieu-mau' },
    { id: 2, name: 'Đèn ngủ gấu cute', image: 'https://placehold.co/600x600/fce4ec/d1567a?text=Den%20ngu%20gau', badge: 'Mới', badgeType: 'new', rating: 5, reviews: 98, price: 149000, original_price: null, slug: 'den-ngu-gau-cute' },
    { id: 3, name: 'Set kẹp tóc nơ xinh xắn', image: 'https://placehold.co/600x600/fce4ec/d1567a?text=Kep%20toc%20no', badge: 'Bán chạy', badgeType: 'best', rating: 5, reviews: 76, price: 59000, original_price: null, slug: 'set-kep-toc-no-xinh-xan' },
    { id: 4, name: 'Ly giữ nhiệt Good Day 500ml', image: 'https://placehold.co/600x600/fce4ec/d1567a?text=Ly%20giu%20nhiet', badge: 'Bán chạy', badgeType: 'best', rating: 5, reviews: 201, price: 139000, original_price: null, slug: 'ly-giu-nhiet-good-day-500ml' },
    { id: 5, name: 'Vòng tay charm bạc xinh', image: 'https://placehold.co/600x600/fce4ec/d1567a?text=Vong%20charm', badge: '-15%', badgeType: 'discount', rating: 5, reviews: 88, price: 109000, original_price: 129000, slug: 'vong-tay-charm-bac-xinh' },
  ];

  const designProductImages = [
    'https://placehold.co/600x600/fce4ec/d1567a?text=Moc%20khoa%20beaded',
    'https://placehold.co/600x600/fce4ec/d1567a?text=Den%20ngu%20gau',
    'https://placehold.co/600x600/fce4ec/d1567a?text=Kep%20toc%20no',
    'https://placehold.co/600x600/fce4ec/d1567a?text=Ly%20giu%20nhiet',
    'https://placehold.co/600x600/fce4ec/d1567a?text=Vong%20charm',
  ];

  useEffect(() => {
    fetch('/api/products?limit=8')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products.map((p, i) => ({
            id: p.id,
            name: p.name,
            image: p.thumbnail || designProductImages[i % 5],
            price: p.price,
            original_price: p.original_price,
            slug: p.slug,
            reviews: [124, 98, 76, 201, 88, 64, 42, 55][i % 8],
            unit: p.unit,
            badge: fallbackProducts[i % 5].badge,
            badgeType: fallbackProducts[i % 5].badgeType,
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

  const badgeColors = { discount: RED, new: '#4CAF50', best: '#ff9800' };

  return (
    <section id="featured-products" style={{ backgroundColor: '#fff', padding: '36px 0 40px' }}>
      <div className="container mx-auto px-4">
        <SectionHead title="Sản phẩm bán chạy" href="/products" k="sec_products" />
        <div className="cf-prod-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16 }}>
          {products.slice(0, 5).map((prod) => {
            const hasDiscount = prod.original_price && prod.original_price > prod.price;
            const isAdding = addingId === prod.id;
            return (
              <div key={prod.id} className="cf-prod-card"
                style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f5e0e8', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s', position: 'relative', cursor: 'pointer' }}>
                {prod.badge && (
                  <span style={{ position: 'absolute', top: 10, left: 10, zIndex: 3, backgroundColor: badgeColors[prod.badgeType] || RED, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>{prod.badge}</span>
                )}
                <Link href={`/products/${prod.slug}`} style={{ display: 'block', height: 190, backgroundColor: '#fff9fb', overflow: 'hidden', padding: '12px' }}>
                  <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.5s' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'; }} />
                </Link>
                <div style={{ padding: '12px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Link href={`/products/${prod.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: ESPRESSO, lineHeight: 1.4, marginBottom: 6, minHeight: 36, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prod.name}</h3>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    <span style={{ display: 'inline-flex', gap: 1 }}>{[0,1,2,3,4].map(i => <Star key={i} f />)}</span>
                    <span style={{ fontSize: 10.5, color: '#b39aa4', fontWeight: 500 }}>({prod.reviews})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: PINK }}>{prod.price.toLocaleString('vi-VN')}đ</span>
                    {hasDiscount && <span style={{ fontSize: 11.5, color: '#c4a0a8', textDecoration: 'line-through' }}>{prod.original_price.toLocaleString('vi-VN')}đ</span>}
                  </div>
                  <button onClick={(e) => handleAddToCart(e, prod)} disabled={isAdding}
                    style={{ width: 36, height: 36, backgroundColor: isAdding ? '#4CAF50' : '#fff', color: isAdding ? '#fff' : PINK, border: `1.5px solid ${isAdding ? '#4CAF50' : PINK}`, borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', transition: 'all 0.2s', flexShrink: 0 }}
                    onMouseEnter={(e) => { if (!isAdding) { e.currentTarget.style.backgroundColor = PINK; e.currentTarget.style.color = '#fff'; } }}
                    onMouseLeave={(e) => { if (!isAdding) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = PINK; } }}>
                    {isAdding ? '✓' : <CartIcon />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .cf-prod-card:hover { box-shadow: 0 12px 28px rgba(239,125,156,0.15); transform: translateY(-3px); border-color: #f0b3c8; }
        .cf-prod-card:hover img { transform: scale(1.05); }
        @media (max-width: 1280px) { .cf-prod-grid { grid-template-columns: repeat(4, minmax(0,1fr)) !important; } }
        @media (max-width: 1024px) { .cf-prod-grid { grid-template-columns: repeat(3, minmax(0,1fr)) !important; } }
        @media (max-width: 600px) { .cf-prod-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
      `}</style>
    </section>
  );
}
