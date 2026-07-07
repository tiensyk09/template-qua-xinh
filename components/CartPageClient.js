'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';

export default function CartPageClient() {
  const router = useRouter();
  const { items, subtotal, updateQty, removeItem, clearCart, hydrated } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [invalidItems, setInvalidItems] = useState({});

  // Auto-recalculate discount if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (subtotal < (appliedCoupon.min_order || 0)) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError(`Mã giảm giá yêu cầu đơn hàng tối thiểu từ ${(appliedCoupon.min_order || 0).toLocaleString('vi-VN')}đ`);
      } else {
        let disc = 0;
        if (appliedCoupon.discount_type === 'percent') {
          disc = (subtotal * appliedCoupon.discount_value) / 100;
          if (appliedCoupon.max_discount && disc > appliedCoupon.max_discount) {
            disc = appliedCoupon.max_discount;
          }
        } else {
          disc = appliedCoupon.discount_value;
        }
        setCouponDiscount(disc);
      }
    }
  }, [subtotal, appliedCoupon]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data.coupon);
        localStorage.setItem('lc_applied_coupon', JSON.stringify(data.coupon));
        setCouponError('');
      } else {
        setCouponError(data.error || 'Mã giảm giá không hợp lệ');
        setAppliedCoupon(null);
        setCouponDiscount(0);
      }
    } catch {
      setCouponError('Lỗi kiểm tra mã giảm giá');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    localStorage.removeItem('lc_applied_coupon');
  };

  // Shipping Fee Logic: free if subtotal >= 500k, otherwise 30k (Matching topbar info)
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const finalTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  // Validate items on mount/cart update
  useEffect(() => {
    if (!hydrated || items.length === 0) return;

    async function validateCartItems() {
      try {
        const res = await fetch('/api/orders/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(i => ({
              product_id: i.product_id,
              variant_id: i.variant_id,
              quantity: i.quantity
            }))
          })
        });
        const data = await res.json();
        if (res.ok) {
          if (!data.success) {
            setValidationError(data.error);
            setInvalidItems(data.invalidItems || {});
          } else {
            setValidationError('');
            setInvalidItems({});
          }
        }
      } catch (err) {
        console.error('Failed to validate cart items:', err);
      }
    }

    validateCartItems();
  }, [items, hydrated]);

  const handleCheckout = () => {
    localStorage.setItem('lc_checkout_pricing', JSON.stringify({
      subtotal,
      discount: couponDiscount,
      shippingFee,
      total: finalTotal,
      couponCode: appliedCoupon?.code || ''
    }));
    router.push('/checkout');
  };

  if (!hydrated) {
    return (
      <div style={{ backgroundColor: '#fef4f8', minHeight: '100vh', padding: '100px 0', textAlign: 'center' }}>
        <div style={{ color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>Đang tải thông tin giỏ hàng...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fef4f8', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumbs */}
        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#374151', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <span style={{ color: '#b85c78', fontWeight: 600 }}>Giỏ hàng</span>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#4a2a38', marginBottom: '20px' }}>
          Giỏ Hàng Của Bạn ({items.length} sản phẩm)
        </h1>

        {validationError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
            ⚠️ {validationError}
          </div>
        )}

        {items.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#4a2a38' }}>Giỏ hàng trống</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '6px' }}>Bạn chưa chọn sản phẩm nào.</p>
            <Link
              href="/products"
              style={{ display: 'inline-block', marginTop: '20px', background: '#b85c78', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '30px', fontWeight: 700, textDecoration: 'none' }}
              className="cart-checkout-btn-hover"
            >
              Tiếp tục chọn sản phẩm
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }} className="cart-page-layout">
            
            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="lc-cart-item"
                  >
                    {/* Image */}
                    <div className="lc-cart-item-image">
                      <img
                        src={item.thumbnail || 'https://picsum.photos/100/100?random=' + item.product_id}
                        alt={item.product_name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.src = 'https://picsum.photos/100/100?random=' + item.product_id;
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="lc-cart-item-info">
                      <h4 className="lc-cart-item-title">
                        {item.product_name}
                      </h4>
                      <span style={{ fontSize: '11.5px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#6b7280', fontWeight: 500 }}>
                        Đơn vị: {item.variant_name || 'Hộp'}
                      </span>
                      <div style={{ marginTop: '6px', fontSize: '13.5px', fontWeight: 700, color: '#6b7280' }}>
                        Đơn giá: {item.unit_price.toLocaleString('vi-VN')}đ
                      </div>
                      {invalidItems[item.key] && (
                        <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#ef4444', fontWeight: 600 }}>
                          ⚠️ {invalidItems[item.key]}
                        </div>
                      )}
                    </div>

                    {/* Quantity + Price total + Action */}
                    <div className="lc-cart-item-actions">
                      {/* Qty Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                        <button
                          onClick={() => updateQty(item.key, item.quantity - 1)}
                          style={{ width: '28px', height: '28px', border: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
                        >
                          -
                        </button>
                        <span style={{ width: '32px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#4a2a38' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.key, item.quantity + 1)}
                          style={{ width: '28px', height: '28px', border: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="lc-cart-item-total">
                        {(item.unit_price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeItem(item.key)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                        title="Xóa sản phẩm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/products" style={{ color: '#b85c78', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                  ← Chọn thêm sản phẩm khác
                </Link>
                <button
                  onClick={clearCart}
                  style={{ border: 'none', background: 'transparent', color: '#9ca3af', fontSize: '13.5px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Xóa sạch giỏ hàng
                </button>
              </div>
            </div>

            {/* Order Summary Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="cart-summary-column">
              {/* Coupon Box */}
              <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#4a2a38', margin: '0 0 12px 0' }}>
                  Mã Giảm Giá
                </h3>
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      textTransform: 'uppercase'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!!appliedCoupon || !couponCode.trim()}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: (appliedCoupon || !couponCode.trim()) ? '#cbd5e1' : '#b85c78',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                    className="cart-checkout-btn-hover"
                  >
                    Áp dụng
                  </button>
                </form>
                {couponError && <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>{couponError}</p>}
                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f6', border: '1px solid #f8d7e0', padding: '8px 12px', borderRadius: '6px', marginTop: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>
                      ✓ Mã: {appliedCoupon.code} (-{appliedCoupon.discount_type === 'percent' ? `${appliedCoupon.discount_value}%` : `${appliedCoupon.discount_value.toLocaleString('vi-VN')}đ`})
                    </span>
                    <span
                      onClick={handleRemoveCoupon}
                      style={{ color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      Gỡ bỏ
                    </span>
                  </div>
                )}
              </div>

              {/* Pricing Summary */}
              <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#4a2a38', margin: '0 0 16px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
                  Chi Tiết Thanh Toán
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#374151' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Tạm tính</span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                      <span>Giảm giá</span>
                      <span>-{couponDiscount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Phí vận chuyển</span>
                    <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}</span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#6b7280', margin: 0, fontStyle: 'italic' }}>
                    * Miễn phí vận chuyển cho đơn hàng từ 500.000đ.
                  </p>
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15.5px', color: '#4a2a38' }}>
                    <span>Tổng cộng</span>
                    <span style={{ fontSize: '20px', color: '#d97706' }}>{finalTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={!!validationError}
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '14px',
                    borderRadius: '30px',
                    border: 'none',
                    background: !!validationError ? '#9ca3af' : '#d97706',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: !!validationError ? 'not-allowed' : 'pointer',
                    opacity: !!validationError ? 0.7 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  className="cart-checkout-btn-hover"
                >
                  Tiến hành đặt hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .lc-cart-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
        }
        .lc-cart-item-image {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background-color: #f9fafb;
        }
        .lc-cart-item-info {
          flex: 1;
          min-width: 0;
        }
        .lc-cart-item-title {
          font-size: 15px;
          font-weight: 700;
          color: #4a2a38;
          margin: 0 0 6px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .lc-cart-item-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-shrink: 0;
        }
        .lc-cart-item-total {
          width: 110px;
          text-align: right;
          font-weight: 800;
          color: #b85c78;
          font-size: 15px;
        }
        .cart-checkout-btn-hover:hover:not(:disabled) {
          background-color: #b45309 !important;
        }

        @media (max-width: 900px) {
          .cart-page-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          .lc-cart-item {
            display: grid !important;
            grid-template-columns: 80px 1fr !important;
            gap: 16px !important;
            padding: 16px !important;
          }
          .lc-cart-item-title {
            white-space: normal !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            height: auto !important;
            font-size: 13.5px !important;
          }
          .lc-cart-item-actions {
            grid-column: 1 / -1 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-top: 1px solid #f3f4f6 !important;
            padding-top: 12px !important;
            margin-top: 4px !important;
            gap: 8px !important;
          }
          .lc-cart-item-total {
            width: auto !important;
            text-align: right !important;
            flex: 1 !important;
            font-size: 14.5px !important;
          }
        }
      `}</style>
    </div>
  );
}
