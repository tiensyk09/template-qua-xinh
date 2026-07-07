'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';

export default function ProductDetailClient({
  product = {},
  variants = [],
  reviews = [],
  related = []
}) {
  const router = useRouter();
  const { addItem, showToast, toggleWishlist, isInWishlist } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [adding, setAdding] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [localReviews, setLocalReviews] = useState(reviews);

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : (product.flash_sale_price || product.price);

  const originalPrice = product.original_price;

  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = (redirect = false) => {
    setAdding(true);
    addItem(product, selectedVariant, quantity);
    setTimeout(() => {
      setAdding(false);
      if (redirect) {
        router.push('/cart');
      }
    }, 500);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;

    const newRev = {
      id: Date.now(),
      reviewer_name: reviewForm.name,
      rating: parseInt(reviewForm.rating),
      comment: reviewForm.comment,
      is_verified: 1,
      created_at: new Date().toISOString()
    };

    setLocalReviews([newRev, ...localReviews]);
    setReviewForm({ name: '', rating: 5, comment: '' });
    showToast('Cảm ơn bạn đã gửi đánh giá!', 'success');
  };

  return (
    <div>
      <main style={{ background: '#fef4f8', padding: '24px 0 60px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumbs */}
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#374151', textDecoration: 'none' }}>Trang chủ</Link>
            <span>/</span>
            <Link href="/products" style={{ color: '#374151', textDecoration: 'none' }}>Sản phẩm</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category_slug}`} style={{ color: '#374151', textDecoration: 'none' }}>
              {product.category_name}
            </Link>
            <span>/</span>
            <span style={{ color: '#b85c78', fontWeight: 600 }}>{product.name}</span>
          </div>

          {/* Product Info Card */}
          <div className="product-detail-grid" style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
            {/* Image Gallery */}
            <div>
              <div className="product-image-box" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img
                  src={product.thumbnail || 'https://picsum.photos/400/400?random=' + product.id}
                  alt={product.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px' }}
                  onError={(e) => {
                    e.target.src = 'https://picsum.photos/400/400?random=' + product.id;
                  }}
                />
              </div>
            </div>

            {/* Product Meta Details */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {product.brand && (
                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#b85c78', fontWeight: 800, marginBottom: '8px', display: 'block' }}>
                  Thương hiệu: {product.brand} | Xuất xứ: {product.origin || 'Đang cập nhật'}
                </span>
              )}
              <h1 style={{ fontSize: '24px', fontWeight: 950, color: '#4a2a38', margin: '0 0 12px 0', lineHeight: '1.3' }}>
                {product.name}
              </h1>

              {/* Ratings Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', color: '#fbbf24', fontSize: '16px' }}>
                  {'★'.repeat(Math.round(product.rating || 5))}
                  {'☆'.repeat(5 - Math.round(product.rating || 5))}
                </div>
                <span style={{ fontSize: '13.5px', color: '#6b7280' }}>
                  ({localReviews.length} đánh giá)
                </span>
                <span style={{ color: '#eee' }}>|</span>
                <span style={{ fontSize: '13.5px', color: '#ef7d9c', fontWeight: 600 }}>
                  ✓ Còn hàng (Còn {selectedVariant ? selectedVariant.stock : product.stock} {selectedVariant ? selectedVariant.name : (product.unit || 'Hộp')})
                </span>
              </div>

              {/* Price row */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#b85c78' }}>
                  {displayPrice.toLocaleString('vi-VN')}đ
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  / {selectedVariant ? selectedVariant.name : (product.unit || 'Hộp')}
                </span>
                {originalPrice && originalPrice > displayPrice && (
                  <span style={{ fontSize: '16px', color: '#9ca3af', textDecoration: 'line-through' }}>
                    {originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>

              {/* Variant Selector */}
              {variants.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a2a38' }}>
                    Chọn Đơn Vị Tính:
                  </span>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid #b85c78' : '1.5px solid #cbd5e1',
                            background: isSelected ? '#fef2f6' : '#fff',
                            color: isSelected ? '#b85c78' : '#374151',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {v.name} - {v.price.toLocaleString('vi-VN')}đ
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#4a2a38' }}>Số lượng:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                  <button
                    onClick={() => handleQtyChange(-1)}
                    style={{ width: '36px', height: '36px', border: 'none', background: '#f8fafc', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
                  >
                    -
                  </button>
                  <span style={{ width: '48px', textAlign: 'center', fontSize: '15px', fontWeight: 600, color: '#4a2a38' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(1)}
                    style={{ width: '36px', height: '36px', border: 'none', background: '#f8fafc', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }} className="product-actions-wrap">
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={adding}
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    padding: '14px 20px',
                    borderRadius: '30px',
                    border: '1.5px solid #b85c78',
                    background: '#fff',
                    color: '#b85c78',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="product-cart-btn"
                >
                  {adding ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}
                </button>
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={adding}
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    padding: '14px 20px',
                    borderRadius: '30px',
                    border: 'none',
                    background: '#d97706',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="product-buy-btn"
                >
                  Mua ngay
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '1.5px solid ' + (isInWishlist(product.id) ? '#fee2e2' : '#cbd5e1'),
                    background: isInWishlist(product.id) ? '#fee2e2' : '#ffffff',
                    color: '#ef4444',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  className="product-wishlist-btn-detail"
                  title={isInWishlist(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                >
                  {isInWishlist(product.id) ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          </div>

          {/* Description & Reviews Tabs */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('description')}
                style={{
                  padding: '16px 24px',
                  border: 'none',
                  background: activeTab === 'description' ? '#fff' : 'transparent',
                  borderBottom: activeTab === 'description' ? '3px solid #b85c78' : 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: activeTab === 'description' ? '#b85c78' : '#374151',
                  cursor: 'pointer'
                }}
              >
                Mô tả sản phẩm
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                style={{
                  padding: '16px 24px',
                  border: 'none',
                  background: activeTab === 'reviews' ? '#fff' : 'transparent',
                  borderBottom: activeTab === 'reviews' ? '3px solid #b85c78' : 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: activeTab === 'reviews' ? '#b85c78' : '#374151',
                  cursor: 'pointer'
                }}
              >
                Đánh giá từ khách hàng ({localReviews.length})
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {activeTab === 'description' ? (
                <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151' }}>
                  {product.short_description && (
                    <p style={{ fontWeight: 700, fontSize: '16px', color: '#4a2a38', marginBottom: '16px' }}>
                      {product.short_description}
                    </p>
                  )}
                  <div
                    dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.' }}
                    style={{ whiteSpace: 'pre-line' }}
                  />
                </div>
              ) : (
                <div>
                  {/* Reviews List */}
                  {localReviews.length === 0 ? (
                    <p style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                      Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                      {localReviews.map((rev) => (
                        <div key={rev.id} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                            <strong style={{ fontSize: '14.5px', color: '#4a2a38' }}>{rev.reviewer_name}</strong>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', color: '#fbbf24', fontSize: '13px', marginBottom: '6px' }}>
                            {'★'.repeat(rev.rating)}
                            {'☆'.repeat(5 - rev.rating)}
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Review Form */}
                  <form onSubmit={handleReviewSubmit} style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#4a2a38', margin: '0 0 16px 0' }}>
                      Viết đánh giá của bạn
                    </h4>
                    <div className="product-review-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Tên của bạn *</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                          placeholder="Nhập tên của bạn..."
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Đánh giá sao *</label>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#fff', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          <option value="5">5 sao (Rất tốt)</option>
                          <option value="4">4 sao (Tốt)</option>
                          <option value="3">3 sao (Bình thường)</option>
                          <option value="2">2 sao (Kém)</option>
                          <option value="1">1 sao (Rất kém)</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Bình luận của bạn *</label>
                      <textarea
                        required
                        rows="4"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        placeholder="Chia sẻ nhận xét của bạn về sản phẩm..."
                      />
                    </div>
                    <button
                      type="submit"
                      style={{ background: '#b85c78', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: '20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                      className="product-submit-review-btn"
                    >
                      Gửi đánh giá
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#4a2a38', marginBottom: '16px' }}>
                Sản phẩm liên quan
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {related.map((prod) => (
                  <div key={prod.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                    <Link href={`/products/${prod.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ width: '100%', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                        <img
                          src={prod.thumbnail || 'https://picsum.photos/150/150?random=' + prod.id}
                          alt={prod.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={(e) => { e.target.src = 'https://picsum.photos/150/150?random=' + prod.id; }}
                        />
                      </div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#374151', margin: 0, height: '38px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                        {prod.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#b85c78' }}>
                          {prod.price.toLocaleString('vi-VN')}đ
                        </span>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                          / {prod.unit || 'Hộp'}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .product-detail-grid {
          display: grid;
          grid-template-columns: 460px 1fr;
          gap: 40px;
        }
        .product-image-box {
          height: 400px;
        }
        .product-buy-btn:hover {
          background-color: #b45309 !important;
        }
        .product-cart-btn:hover {
          background-color: #fef2f6 !important;
        }
        .product-submit-review-btn:hover {
          background-color: #0b5328 !important;
        }
        .product-wishlist-btn-detail:hover {
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
        }

        @media (max-width: 900px) {
          .product-detail-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 24px !important;
            padding: 16px !important;
          }
          .product-image-box {
            height: 300px !important;
          }
          .product-actions-wrap {
            gap: 12px !important;
          }
          .product-review-form-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
