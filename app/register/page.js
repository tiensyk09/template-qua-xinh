'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ username: '', password: '', displayName: '', email: '', tier: 'Free' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError('Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm 1 chữ viết hoa và 1 ký tự đặc biệt.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng ký thất bại. Vui lòng thử lại.');
        return;
      }
      // Successfully authenticated and registered, redirect to destination
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch {
      setError('Không thể kết nối đến máy chủ đăng ký.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #4a2a38 0%, #064e3b 40%, #b85c78 70%, #1a3a1a 100%)'
    }}>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(212,175,55,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '25%', left: '4%', fontSize: '80px', opacity: 0.05, pointerEvents: 'none', userSelect: 'none' }}>☕</div>
      <div style={{ position: 'absolute', bottom: '25%', right: '5%', fontSize: '80px', opacity: 0.05, pointerEvents: 'none', userSelect: 'none' }}>☕</div>

      <div style={{
        width: '100%',
        maxWidth: '460px',
        margin: '16px',
        background: '#ffffff',
        border: '1px solid rgba(13, 104, 50, 0.1)',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '50px', marginBottom: '10px', lineHeight: 1 }}>☕</div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#4a2a38', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Đăng Ký Thành Viên
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            Tạo tài khoản mua sắm và quản lý đơn hàng
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#b91c1c',
            marginBottom: '16px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} autoComplete="off">
          
          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tên đăng nhập <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none', color: '#4b5563' }}>👤</span>
              <input
                type="text"
                placeholder="Chọn tên đăng nhập (không chứa khoảng trắng)..."
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                minLength={3}
                autoComplete="new-username"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  color: '#4a2a38',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#b85c78'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Họ và tên
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none', color: '#4b5563' }}>📝</span>
              <input
                type="text"
                placeholder="Nhập họ và tên đầy đủ..."
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
                autoComplete="new-displayname"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  color: '#4a2a38',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#b85c78'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Địa chỉ Email <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none', color: '#4b5563' }}>✉️</span>
              <input
                type="email"
                placeholder="Nhập địa chỉ Email..."
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="new-email"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  color: '#4a2a38',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#b85c78'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mật khẩu <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none', color: '#4b5563' }}>🔒</span>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Tối thiểu 8 ký tự, 1 viết hoa, 1 ký tự đặc biệt..."
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '11px 44px 11px 40px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  color: '#4a2a38',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#b85c78'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#4b5563', outline: 'none', padding: 0 }}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              background: loading ? '#6b7280' : 'linear-gradient(135deg, #b85c78 0%, #15803d 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(13, 104, 50, 0.35)'
            }}
          >
            {loading ? 'Đang đăng ký...' : '🚀 Đăng Ký Tài Khoản'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }} className="login-back">
          <Link href="/" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>
            ← Về trang chủ
          </Link>
          <Link 
            href={searchParams.get('redirect') ? `/login?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '/login'} 
            style={{ fontSize: '13px', color: '#b85c78', fontWeight: 600, textDecoration: 'none' }}
          >
            Đã có tài khoản? →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        background: 'linear-gradient(135deg, #4a2a38 0%, #064e3b 40%, #b85c78 70%, #1a3a1a 100%)',
        color: '#fff'
      }}>
        Đang tải...
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
