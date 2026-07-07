'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';

export default function CheckoutPageClient() {
  const router = useRouter();
  const { items, subtotal, clearCart, hydrated, removeItem } = useCart();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    province: 'Hồ Chí Minh',
    note: '',
    paymentMethod: 'cod'
  });

  const [pricing, setPricing] = useState({
    subtotal: 0,
    discount: 0,
    shippingFee: 30000,
    total: 0,
    couponCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationError, setValidationError] = useState('');
  const [invalidItems, setInvalidItems] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Load pricing info
  useEffect(() => {
    const savedPricing = localStorage.getItem('lc_checkout_pricing');
    if (savedPricing) {
      setPricing(JSON.parse(savedPricing));
    } else {
      const shipping = subtotal >= 500000 ? 0 : 30000;
      setPricing({
        subtotal,
        discount: 0,
        shippingFee: shipping,
        total: subtotal + shipping,
        couponCode: ''
      });
    }
  }, [subtotal]);

  // Pre-fill fields if user is logged in
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const res = await fetch('/api/auth/login');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setForm(prev => ({
              ...prev,
              name: data.user.displayName || prev.name,
              phone: data.user.phone || prev.phone,
              email: data.user.email || prev.email,
              address: data.user.address || prev.address
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load user info for auto pre-fill:', err);
      }
    }
    loadUserProfile();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push('/cart');
    }
  }, [items, orderSuccess, router]);

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
        console.error('Failed to validate cart items on checkout load:', err);
      }
    }

    validateCartItems();
  }, [items, hydrated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!form.name || !form.phone || !form.address) {
      setErrorMsg('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
      setLoading(false);
      return;
    }

    const payload = {
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email,
      shipping_address: form.address,
      shipping_province: form.province,
      shipping_note: form.note,
      items: items.map(i => ({
        product_id: i.product_id,
        variant_id: i.variant_id,
        quantity: i.quantity
      })),
      coupon_code: pricing.couponCode,
      payment_method: form.paymentMethod
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess(data);
        clearCart();
        localStorage.removeItem('lc_checkout_pricing');
        localStorage.removeItem('lc_applied_coupon');
      } else {
        if (data.requireLogin) {
          setErrorMsg('Bạn cần đăng nhập để tiến hành đặt hàng.');
          setTimeout(() => {
            router.push(`/login?redirect=/checkout`);
          }, 1500);
        } else {
          setErrorMsg(data.error || 'Đặt hàng thất bại. Vui lòng kiểm tra lại.');
        }
      }
    } catch {
      setErrorMsg('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div style={{ backgroundColor: '#fef4f8', minHeight: '100vh', padding: '100px 0', textAlign: 'center' }}>
        <div style={{ color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>Đang chuẩn bị thông tin đặt hàng...</div>
      </div>
    );
  }

  if (orderSuccess) {
    const { order, paymentInfo } = orderSuccess;
    return (
      <div style={{ backgroundColor: '#fef4f8', minHeight: '100vh', padding: '40px 0 80px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', textAlign: 'center', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#4a2a38', margin: '0 0 8px 0' }}>
              Đặt Hàng Thành Công!
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '24px' }}>
              Mã đơn hàng của bạn là: <strong style={{ color: '#d97706', fontSize: '18px' }}>{order.order_code}</strong>
            </p>

            {paymentInfo ? (
              /* Bank Transfer Payment Info */
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', margin: '0 auto 24px auto', textAlign: 'left' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#4a2a38', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', textAlign: 'center' }}>
                  Thông Tin Chuyển Khoản Ngân Hàng
                </h3>
                <div className="bank-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '20px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14.5px', color: '#374151' }}>
                    <div>Ngân hàng: <strong>{paymentInfo.bankName}</strong></div>
                    <div>Số tài khoản: <strong style={{ fontSize: '16px', color: '#b85c78' }}>{paymentInfo.bankAccount || 'Đang tải...'}</strong></div>
                    <div>Chủ tài khoản: <strong>{paymentInfo.bankOwner}</strong></div>
                    <div>Số tiền: <strong style={{ fontSize: '16px', color: '#d97706' }}>{paymentInfo.amount.toLocaleString('vi-VN')}đ</strong></div>
                    <div>Nội dung CK: <strong style={{ color: '#dc2626' }}>{paymentInfo.description}</strong></div>
                  </div>
                  {paymentInfo.qrUrl && (
                    <div style={{ textAlign: 'center' }} className="bank-qr-wrap">
                      <img
                        src={paymentInfo.qrUrl}
                        alt="VietQR code"
                        style={{ width: '150px', height: '150px', objectFit: 'contain', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px', backgroundColor: '#fff' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Quét mã QR để chuyển khoản nhanh</div>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '12.5px', color: '#6b7280', margin: '16px 0 0 0', lineHeight: '1.5', fontStyle: 'italic', borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                  * Hệ thống sẽ tự động xác nhận đơn hàng sau khi nhận được chuyển khoản. Quý khách vui lòng điền chính xác nội dung chuyển khoản ở trên để tránh sự cố chậm trễ.
                </p>
              </div>
            ) : (
              /* COD Info */
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', margin: '0 auto 24px auto', fontSize: '14.5px', textAlign: 'left', color: '#374151' }}>
                <p style={{ margin: 0, lineHeight: '1.6' }}>
                  ✓ Phương thức thanh toán: <strong>Thanh toán khi nhận hàng (COD)</strong>.
                </p>
                <p style={{ margin: '8px 0 0 0', lineHeight: '1.6' }}>
                  ✓ Đội ngũ Quà Xinh sẽ liên hệ qua điện thoại với quý khách để xác nhận đơn hàng trước khi gửi đi.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/orders"
                style={{ display: 'block', padding: '12px 28px', borderRadius: '30px', background: '#b85c78', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}
                className="checkout-btn-hover"
              >
                Tra cứu lịch sử đơn hàng
              </Link>
              <Link
                href="/products"
                style={{ display: 'block', padding: '12px 28px', borderRadius: '30px', border: '1.5px solid #b85c78', color: '#b85c78', fontWeight: 700, textDecoration: 'none', fontSize: '14px', background: '#fff' }}
              >
                Tiếp tục mua hàng
              </Link>
            </div>
          </div>
        </div>
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
          <Link href="/cart" style={{ color: '#374151', textDecoration: 'none' }}>Giỏ hàng</Link>
          <span>/</span>
          <span style={{ color: '#b85c78', fontWeight: 600 }}>Đặt hàng</span>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#4a2a38', marginBottom: '20px' }}>
          Thông Tin Đặt Hàng & Thanh Toán
        </h1>

        {validationError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
            ⚠️ {validationError}
          </div>
        )}

        {errorMsg && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="checkout-form-grid" style={{ alignItems: 'start' }}>
          {/* Delivery Info */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }} className="checkout-card-panel">
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#4a2a38', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              Thông Tin Nhận Hàng
            </h3>

            <div className="checkout-input-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Nhập họ và tên người nhận..."
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Nhập số điện thoại giao hàng..."
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Địa chỉ Email (Nhận hóa đơn)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="email@example.com"
              />
            </div>

            <div className="checkout-input-grid-15-1">
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Địa chỉ nhận hàng *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Số nhà, ngõ, tên đường, phường/xã, quận/huyện..."
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Tỉnh/Thành phố *</label>
                <select
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#fff', cursor: 'pointer', boxSizing: 'border-box' }}
                >
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Cần Thơ">Cần Thò</option>
                  <option value="Khác">Tỉnh khác</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Ghi chú đơn hàng</label>
              <textarea
                rows="3"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                placeholder="Ghi chú về thời gian giao hàng, hướng dẫn tìm nhà..."
              />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#4a2a38', margin: '12px 0 0 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              Phương Thức Thanh Toán
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1.5px solid ' + (form.paymentMethod === 'cod' ? '#b85c78' : '#cbd5e1'), borderRadius: '10px', cursor: 'pointer', background: form.paymentMethod === 'cod' ? '#fef2f6' : '#fff', transition: 'all 0.15s' }}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={form.paymentMethod === 'cod'}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  style={{ accentColor: '#b85c78' }}
                />
                <div>
                  <strong style={{ color: '#4a2a38', fontSize: '14px' }}>Thanh toán khi nhận hàng (COD)</strong>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Quý khách thanh toán tiền mặt cho nhân viên giao hàng khi nhận quà.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1.5px solid ' + (form.paymentMethod === 'bank' ? '#b85c78' : '#cbd5e1'), borderRadius: '10px', cursor: 'pointer', background: form.paymentMethod === 'bank' ? '#fef2f6' : '#fff', transition: 'all 0.15s' }}>
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={form.paymentMethod === 'bank'}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  style={{ accentColor: '#b85c78' }}
                />
                <div>
                  <strong style={{ color: '#4a2a38', fontSize: '14px' }}>Chuyển khoản ngân hàng (Quét mã VietQR chuyển khoản nhanh)</strong>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Hệ thống hiển thị mã QR kèm nội dung chuyển khoản tự động sau khi đặt hàng thành công.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Order Review Column */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }} className="checkout-card-panel">
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#4a2a38', margin: '0 0 16px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
              Đơn Hàng Của Bạn
            </h3>

            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {items.map((item) => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={item.thumbnail || '/images/default.png'}
                      alt={item.product_name}
                      style={{ width: '48px', height: '48px', objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2px', backgroundColor: '#fff' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{item.product_name}</span>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        Đơn vị: {item.variant_name || 'Hộp'} x {item.quantity}
                      </span>
                      {invalidItems[item.key] && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
                            ⚠️ {invalidItems[item.key]}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline',
                              fontFamily: 'inherit'
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#b85c78', marginLeft: '12px', flexShrink: 0 }}>
                    {(item.unit_price * item.quantity).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Tạm tính</span>
                <span>{pricing.subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              {pricing.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                  <span>Giảm giá</span>
                  <span>-{pricing.discount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Phí vận chuyển</span>
                <span>{pricing.shippingFee === 0 ? 'Miễn phí' : `${pricing.shippingFee.toLocaleString('vi-VN')}đ`}</span>
              </div>
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', color: '#4a2a38' }}>
                <span>Tổng tiền thanh toán</span>
                <span style={{ fontSize: '18px', color: '#d97706' }}>{pricing.total.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!validationError}
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '14px',
                borderRadius: '30px',
                border: 'none',
                background: !!validationError ? '#9ca3af' : '#d97706',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: (loading || !!validationError) ? 'not-allowed' : 'pointer',
                opacity: (loading || !!validationError) ? 0.7 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="checkout-btn-hover"
            >
              {loading ? 'Đang đặt đơn hàng...' : `Đặt hàng (${pricing.total.toLocaleString('vi-VN')}đ)`}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .checkout-form-grid {
          display: grid;
          grid-template-columns: 1fr 440px;
          gap: 24px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .checkout-card-panel {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .checkout-input-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          width: 100%;
        }
        .checkout-input-grid-15-1 {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 16px;
          width: 100%;
        }
        .checkout-btn-hover:hover:not(:disabled) {
          background-color: #b45309 !important;
        }

        @media (max-width: 900px) {
          .checkout-form-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
          }
        }

        @media (max-width: 600px) {
          .checkout-card-panel {
            padding: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .checkout-input-grid-2,
          .checkout-input-grid-15-1 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .bank-info-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            text-align: center !important;
          }
          .bank-qr-wrap {
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
}
