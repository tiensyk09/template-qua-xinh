'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/app/admin/admin.css';

export default function AdminLoginPage() {
  const router = useRouter();
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
        setError(data.error || 'Authentication failed');
        return;
      }
      // Admin always goes to /admin dashboard
      router.push('/admin');
    } catch {
      setError('Could not connect to authentication server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page" style={{ background: 'linear-gradient(135deg, #0a0d13 0%, #0c1017 50%, #090b10 100%)' }}>
      {/* Custom green glow instead of purple */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(circle at 15% 25%, rgba(239, 125, 156, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 85% 75%, rgba(239, 125, 156, 0.06) 0%, transparent 45%)
        `
      }} />
      <div className="noise-overlay-admin" />

      <div className="login-card" style={{
        background: 'rgba(17, 22, 31, 0.9)',
        border: '1px solid rgba(239, 125, 156, 0.3)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.8), 0 0 40px rgba(209,86,122,0.06)'
      }}>
        {/* Header */}
        <div className="login-logo-wrap">
          {/* Admin badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'rgba(239, 125, 156, 0.2)',
            border: '1px solid rgba(239, 125, 156, 0.4)',
            fontSize: '11px',
            fontWeight: 700,
            color: '#f7a8b8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            🛡️ QUẢN TRỊ VIÊN
          </div>

          <div className="login-logo" style={{ color: '#f9c9d6', filter: 'drop-shadow(0 0 12px rgba(239, 125, 156, 0.8))' }}>
            🎁
          </div>
          <div className="login-title">Admin Portal</div>
          <div className="login-sub">Quà Xinh – Trang quản trị</div>
        </div>

        {error && (
          <div className="adm-alert adm-alert-error" style={{ fontSize: '13px', padding: '10px 14px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="adm-form-group" style={{ margin: 0 }}>
            <label className="adm-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Tên đăng nhập</label>
            <div className="login-input-wrap">
              <span className="login-input-icon" style={{ color: '#6b7280' }}>👤</span>
              <input
                id="admin-login-username"
                type="text"
                className="login-input"
                placeholder="Nhập tên đăng nhập..."
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                autoComplete="username"
                autoFocus
                style={{ borderColor: 'rgba(239, 125, 156, 0.3)', background: '#ffffff', color: '#0f172a', paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="adm-form-group" style={{ margin: 0 }}>
            <label className="adm-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Mật khẩu</label>
            <div className="login-input-wrap">
              <span className="login-input-icon" style={{ color: '#6b7280' }}>🔒</span>
              <input
                id="admin-login-password"
                type={showPw ? 'text' : 'password'}
                className="login-input"
                placeholder="Nhập mật khẩu..."
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
                style={{ paddingRight: '44px', borderColor: 'rgba(239, 125, 156, 0.3)', background: '#ffffff', color: '#0f172a', paddingLeft: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280',
                  outline: 'none'
                }}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
            style={{
              marginTop: '8px',
              background: loading
                ? 'rgba(239, 125, 156, 0.4)'
                : 'linear-gradient(135deg, #ef7d9c 0%, #d1567a 100%)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(239, 125, 156, 0.4)'
            }}
          >
            {loading ? 'Đang xác thực...' : '🔐 Đăng nhập Admin'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }} className="login-back">
          <Link href="/">← Về trang chủ</Link>
          <Link href="/login" style={{ color: '#f7a8b8', fontWeight: '600' }}>
            Đăng nhập khách hàng →
          </Link>
        </div>
      </div>

      {/* Override login CSS colors to match green theme */}
      <style>{`
        .login-input:focus {
          border-color: #ef7d9c !important;
          box-shadow: 0 0 8px rgba(239, 125, 156, 0.3) !important;
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #d1567a 0%, #ef7d9c 100%) !important;
          box-shadow: 0 0 16px rgba(239, 125, 156, 0.5) !important;
        }
        .login-back a {
          color: rgba(255,255,255,0.4);
        }
        .login-back a:hover {
          color: #f7a8b8;
        }
      `}</style>
    </div>
  );
}
