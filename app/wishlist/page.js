'use client';
import React from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addItem, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div style={{ backgroundColor: '#fef4f8', minHeight: '100vh', padding: '100px 0', textAlign: 'center' }}>
        <div style={{ color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>Đang tải danh sách yêu thích...</div>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    // Add to cart with default variant if available, otherwise pass null
    addItem(product, null, 1);
  };

  return (
    <div style={{ backgroundColor: '#fef4f8', minHeight: '100vh', padding: '40px 0 80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: '#6b7280' }}>
          <Link href="/" style={{ color: '#374151', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <span style={{ color: '#b85c78', fontWeight: 600 }}>Sản phẩm yêu thích</span>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 950, color: '#4a2a38', margin: '0 0 8px 0' }}>
            Sản Phẩm Yêu Thích ❤️
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14.5px', margin: 0 }}>
            Lưu trữ những phụ kiện và quà tặng xinh xắn bạn đang quan tâm.
          </p>
        </div>

        {wishlist.length === 0 ? (
          /* Empty State */
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '60px 24px', textAlign: 'center', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>❤️</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#4a2a38', margin: '0 0 8px 0' }}>
              Danh sách yêu thích trống
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
              Hãy nhấn nút trái tim yêu thích ở trang chi tiết sản phẩm để lưu lại tại đây nhé!
            </p>
            <Link
              href="/products"
              style={{ display: 'inline-block', padding: '12px 30px', borderRadius: '30px', background: '#b85c78', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}
              className="wishlist-btn-hover"
            >
              Khám phá quà tặng xinh
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {wishlist.map((prod) => (
              <div
                key={prod.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                className="wishlist-item-card"
              >
                {/* Remove from Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(prod)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#fee2e2',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#ef4444',
                    zIndex: 10,
                    transition: 'all 0.15s'
                  }}
                  title="Xóa khỏi yêu thích"
                  className="wishlist-remove-btn"
                >
                  ❤️
                </button>

                {/* Product Info Link */}
                <Link href={`/products/${prod.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', flex: 1 }}>
                  {/* Image */}
                  <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <img
                      src={prod.thumbnail || 'https://picsum.photos/200/200?random=' + prod.id}
                      alt={prod.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                    />
                  </div>

                  {/* Brand & Origin */}
                  {prod.brand && (
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#b85c78', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      {prod.brand}
                    </span>
                  )}

                  {/* Title */}
                  <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#4a2a38', margin: '0 0 10px 0', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                    {prod.name}
                  </h4>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#b85c78' }}>
                      {prod.price.toLocaleString('vi-VN')}đ
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      / {prod.unit || 'Hộp'}
                    </span>
                  </div>
                </Link>

                {/* Add to Cart CTA */}
                <button
                  onClick={() => handleAddToCart(prod)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '20px',
                    border: '1.5px solid #b85c78',
                    background: '#ffffff',
                    color: '#b85c78',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="wishlist-cart-btn-hover"
                >
                  Thêm vào giỏ hàng
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .wishlist-btn-hover:hover {
          background-color: #0b5328 !important;
        }
        .wishlist-cart-btn-hover:hover {
          background-color: #fef2f6 !important;
        }
        .wishlist-remove-btn:hover {
          transform: scale(1.1);
          background-color: #fca5a5 !important;
        }
        .wishlist-item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(13, 104, 50, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
