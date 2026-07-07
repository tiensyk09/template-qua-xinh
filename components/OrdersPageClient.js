'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OrdersPageClient() {
  // Session & Profile States
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Orders History States
  const [myOrders, setMyOrders] = useState([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);
  const [requireLogin, setRequireLogin] = useState(false);

  // Search/Lookup States
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Load profile and orders on mount
  useEffect(() => {
    async function loadData() {
      setMyOrdersLoading(true);
      setProfileLoading(true);
      try {
        // Fetch session
        const sessionRes = await fetch('/api/auth/login');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.user) {
            setUser(sessionData.user);
            setDisplayName(sessionData.user.displayName || '');
            setEmail(sessionData.user.email || '');
            setPhone(sessionData.user.phone || '');
            setAddress(sessionData.user.address || '');
            setRequireLogin(false);

            // Fetch orders
            const ordersRes = await fetch('/api/orders/my');
            if (ordersRes.ok) {
              const ordersData = await ordersRes.json();
              setMyOrders(ordersData.orders || []);
            }
          }
        } else if (sessionRes.status === 401) {
          setRequireLogin(true);
        }
      } catch (err) {
        console.error('Failed to load profile or order data:', err);
      } finally {
        setMyOrdersLoading(false);
        setProfileLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          email,
          phone,
          address
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProfileSuccess('Cập nhật thông tin thành công!');
        if (data.user) {
          setUser(data.user);
        }
      } else {
        setProfileError(data.error || 'Cập nhật thất bại. Vui lòng kiểm tra lại.');
      }
    } catch {
      setProfileError('Có lỗi xảy ra trong quá trình cập nhật.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    if (!searchCode.trim()) return;

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/orders/${searchCode.trim()}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setSearchResult(data.order);
      } else {
        setSearchError(data.error || 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã.');
      }
    } catch {
      setSearchError('Đã xảy ra lỗi khi tra cứu đơn hàng.');
    } finally {
      setSearchLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { text: 'Chờ xác nhận', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
      confirmed: { text: 'Đã xác nhận', color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
      shipping: { text: 'Đang giao hàng', color: '#7c3aed', bg: '#f3e8ff', border: '#e9d5ff' },
      completed: { text: 'Đã giao hàng', color: '#ef7d9c', bg: '#fbe4ec', border: '#f8d7e0' },
      cancelled: { text: 'Đã hủy', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' }
    };
    const s = map[status] || { text: status, color: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb' };
    return (
      <span style={{
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '11.5px',
        fontWeight: 700
      }}>
        {s.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const map = {
      pending: { text: 'Chưa thanh toán', color: '#ea580c', bg: '#ffedd5', border: '#fed7aa' },
      paid: { text: 'Đã thanh toán', color: '#ef7d9c', bg: '#fbe4ec', border: '#f8d7e0' },
      refunded: { text: 'Đã hoàn tiền', color: '#db2777', bg: '#fce7f3', border: '#fbcfe8' }
    };
    const s = map[status] || { text: status, color: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb' };
    return (
      <span style={{
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '10.5px',
        fontWeight: 700,
        marginLeft: '6px'
      }}>
        {s.text}
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: '#fef4f8', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumbs */}
        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#374151', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <span style={{ color: '#b85c78', fontWeight: 600 }}>Tài khoản của tôi</span>
        </div>

        {requireLogin ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }} className="orders-unauth-layout">
            
            {/* Quick Lookup Form (Does not require login) */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#4a2a38', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔍</span> Tra Cứu Đơn Hàng Nhanh
              </h3>
              <p style={{ color: '#6b7280', fontSize: '13.5px', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                Nhập mã đơn hàng (ví dụ: GD-xxxxxxxxxx) để kiểm tra trạng thái xử lý và vận chuyển trực tiếp.
              </p>

              <form onSubmit={handleLookup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  type="text"
                  required
                  placeholder="Nhập mã đơn hàng (GD-...)"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  style={{
                    padding: '12px',
                    borderRadius: '24px',
                    border: 'none',
                    background: '#b85c78',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  className="orders-btn-hover"
                >
                  {searchLoading ? 'Đang kiểm tra...' : 'Tra cứu ngay ➔'}
                </button>
              </form>

              {searchError && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '13px' }}>
                  {searchError}
                </div>
              )}

              {/* Single Search Result */}
              {searchResult && (
                <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '24px', paddingTop: '24px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#4a2a38', margin: '0 0 16px 0' }}>
                    Kết quả tra cứu đơn: {searchResult.order_code}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Trạng thái giao hàng:</span>
                      {getStatusBadge(searchResult.status)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Hình thức thanh toán:</span>
                      <div>
                        <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold' }}>{searchResult.payment_method}</span>
                        {getPaymentStatusBadge(searchResult.payment_status)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Tổng số tiền thanh toán:</span>
                      <strong style={{ color: '#b85c78', fontSize: '15px' }}>{searchResult.total.toLocaleString('vi-VN')}đ</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Thời gian khởi tạo:</span>
                      <span>{new Date(searchResult.created_at).toLocaleString('vi-VN')}</span>
                    </div>

                    <div style={{ marginTop: '16px', borderTop: '1px dashed #f3f4f6', paddingTop: '16px' }}>
                      <span style={{ fontWeight: 700, display: 'block', marginBottom: '10px', color: '#4a2a38' }}>Sản phẩm đã mua:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {searchResult.items.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
                            <span>{it.product_name} x{it.quantity}</span>
                            <strong>{(it.unit_price * it.quantity).toLocaleString('vi-VN')}đ</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Login Prompt card */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '40px 32px', border: '1px solid #e5e7eb', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔐</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#4a2a38', marginBottom: '8px' }}>Xem Lịch Sử Mua Hàng</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                Đăng nhập tài khoản khách hàng để quản lý đơn hàng đã mua, chỉnh sửa thông tin giao hàng & cập nhật số điện thoại cá nhân.
              </p>
              <Link
                href="/login?redirect=/orders"
                style={{
                  display: 'inline-block',
                  background: '#b85c78',
                  color: '#fff',
                  padding: '12px 32px',
                  borderRadius: '24px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '14.5px',
                  transition: 'background 0.2s'
                }}
                className="orders-btn-hover"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        ) : (
          /* Logged In Layout: Profile Update (Left) & Personal History (Right) */
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '28px' }} className="orders-auth-layout">
            
            {/* Left Panel: Profile Management */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', alignSelf: 'start' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#4a2a38', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👤</span> Thông Tin Tài Khoản
              </h3>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 20px 0' }}>
                Cập nhật thông tin liên hệ và địa chỉ nhận hàng.
              </p>

              {profileSuccess && (
                <div style={{ background: '#fbe4ec', border: '1px solid #f8d7e0', color: '#15803d', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
                  🎉 {profileSuccess}
                </div>
              )}
              {profileError && (
                <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                  ⚠️ {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Username (Disabled) */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Tên đăng nhập</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f1f5f9',
                      color: '#64748b',
                      fontSize: '13.5px',
                      cursor: 'not-allowed',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Display Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Họ và tên</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    placeholder="Nhập họ và tên..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Địa chỉ Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Số điện thoại nhận hàng</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại liên lạc..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Địa chỉ giao hàng mặc định</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ghi rõ số nhà, tên đường, phường/xã, quận/huyện, tỉnh thành..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Submit Profile */}
                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{
                    padding: '11px',
                    borderRadius: '24px',
                    border: 'none',
                    background: '#b85c78',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: profileSaving ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    marginTop: '8px'
                  }}
                  className="orders-btn-hover"
                >
                  {profileSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>

            {/* Right Panel: Order History */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#4a2a38', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📦</span> Lịch Sử Đơn Hàng Đã Đặt
              </h3>

              {myOrdersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', fontSize: '14px' }}>
                  Đang tải đơn hàng...
                </div>
              ) : myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#6b7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
                  <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>Bạn chưa đặt bất kỳ đơn hàng nào.</p>
                  <Link href="/products" style={{ color: '#b85c78', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                    Khám phá sản phẩm ngay ➔
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myOrders.map((ord) => (
                    <div key={ord.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px', background: '#fafdfb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1.5px solid #f3f4f6', paddingBottom: '10px' }}>
                        <span style={{ fontWeight: 800, color: '#4a2a38', fontSize: '14.5px' }}>
                          Mã đơn: {ord.order_code}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          {new Date(ord.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      
                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '14px' }}>
                        {ord.items.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                            <span>{it.product_name} x{it.quantity}</span>
                            <strong>{(it.unit_price * it.quantity).toLocaleString('vi-VN')}đ</strong>
                          </div>
                        ))}
                      </div>

                      {/* Summary info */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #e5e7eb', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {getStatusBadge(ord.status)}
                          {getPaymentStatusBadge(ord.payment_status)}
                        </div>
                        <div style={{ fontWeight: 800, color: '#b85c78', fontSize: '16px' }}>
                          {ord.total.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      <style jsx global>{`
        .orders-btn-hover:hover:not(:disabled) {
          background-color: #0b5328 !important;
        }
        @media (max-width: 900px) {
          .orders-unauth-layout,
          .orders-auth-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
