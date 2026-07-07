'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
        return;
      }
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
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
      background: 'linear-gradient(135deg, #4a2a38 0%, #8a3d55 40%, #f7a8b8 70%, #2a1018 100%)'
    }}>
      {/* Decorative background circles */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(212,175,55,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', left: '5%', fontSize: '80px', opacity: 0.06, pointerEvents: 'none', userSelect: 'none' }}>🎁</div>
      <div style={{ position: 'absolute', bottom: '20%', right: '4%', fontSize: '80px', opacity: 0.06, pointerEvents: 'none', userSelect: 'none' }}>🎀</div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        margin: '16px',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '24px',
        padding: '40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px', lineHeight: 1 }}>🎁</div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Đăng Nhập
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
            Chào mừng trở lại Quà Xinh
          </p>

          {/* User Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '12px',
            padding: '5px 14px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: '0.03em'
          }}>
            <span>👤</span> Tài khoản khách hàng
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#fca5a5',
            marginBottom: '20px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Tên đăng nhập
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none' }}>👤</span>
              <input
                id="user-login-username"
                type="text"
                placeholder="Nhập tên đăng nhập..."
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                autoComplete="username"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={e => { e.target.style.borderColor = '#d97706'; e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none' }}>🔒</span>
              <input
                id="user-login-password"
                type={showPw ? 'text' : 'password'}
                placeholder="Nhập mật khẩu..."
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 42px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={e => { e.target.style.borderColor = '#d97706'; e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'rgba(255,255,255,0.5)', outline: 'none', padding: 0 }}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              marginTop: '8px',
              background: loading ? 'rgba(217,119,6,0.5)' : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#4a2a38',
              fontWeight: 800,
              fontSize: '14.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(217,119,6,0.35)'
            }}
          >
            {loading ? 'Đang đăng nhập...' : '🎁 Đăng Nhập'}
          </button>
        </form>

        {/* Footer Links */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
          <Link href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
            ← Về trang chủ
          </Link>
          <Link 
            href={searchParams.get('redirect') ? `/register?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '/register'} 
            style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600, textDecoration: 'none' }}
          >
            Tạo tài khoản →
          </Link>
        </div>

        {/* Admin Login link */}
        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link
            href="/admin/login"
            style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.35)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🛡️ Đăng nhập quản trị viên
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UserLoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        background: 'linear-gradient(135deg, #4a2a38 0%, #8a3d55 40%, #f7a8b8 70%, #2a1018 100%)',
        color: '#fff'
      }}>
        Đang tải...
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
