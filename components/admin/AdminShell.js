'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// Menu quản trị — sắp xếp theo nhóm chức năng, nhãn tiếng Việt
const navItems = [
  { section: 'TỔNG QUAN' },
  { href: '/admin', label: 'Bảng điều khiển', icon: '📊' },

  { section: 'NỘI DUNG', staff: true },
  { href: '/admin/products', label: 'Sản phẩm / Dịch vụ', icon: '🏷️', staff: true },
  { href: '/admin/posts', label: 'Bài viết & Tin tức', icon: '📝', staff: true },
  { href: '/admin/pages', label: 'Trình dựng trang', icon: '🎨', staff: true },
  { href: '/admin/files', label: 'Tệp & Media', icon: '📁', staff: true },

  { section: 'BÁN HÀNG', staff: true },
  { href: '/admin/orders', label: 'Đơn hàng', icon: '📦', staff: true },
  { href: '/admin/coupons', label: 'Mã giảm giá', icon: '🎟️', staff: true },
  { href: '/admin/messages', label: 'Tin nhắn liên hệ', icon: '✉️', staff: true },

  { section: 'NGƯỜI DÙNG', staff: true },
  { href: '/admin/members', label: 'Thành viên', icon: '👥', staff: true },

  { section: 'HỆ THỐNG' },
  { href: '/admin/settings', label: 'Cài đặt chung', icon: '⚙️', staff: true },
  { href: '/admin/plugins', label: 'Tiện ích mở rộng', icon: '🧩', staff: true },
  { href: '/admin/backup', label: 'Sao lưu & Khôi phục', icon: '💾' },
  { href: '/admin/api', label: 'API cho Developer', icon: '🔌' },
  { href: '/admin/profile', label: 'Hồ sơ của tôi', icon: '👤' },
  { href: '/', label: 'Về trang web', icon: '↩️' },
];

export default function AdminShell({ children, title = 'Bảng điều khiển' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('admin_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [pathname]); // kiểm tra lại mỗi khi đổi trang

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/login');
      if (res.ok) {
        const data = await res.json();
        const isStaffUser = data.user.role === 'admin' || data.user.role === 'mod';

        // Thành viên thường chỉ được vào /admin và /admin/profile
        if (!isStaffUser && pathname !== '/admin' && pathname !== '/admin/profile') {
          router.push('/admin');
          return;
        }

        setUser(data.user);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      } else {
        localStorage.removeItem('admin_user');
        router.push('/admin/login');
      }
    } catch {
      localStorage.removeItem('admin_user');
      router.push('/admin/login');
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    localStorage.removeItem('admin_user');
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/admin/login');
  }

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '/') return false;
    return pathname.startsWith(href);
  };

  const isStaff = mounted && (user?.role === 'admin' || user?.role === 'mod');

  const initials = mounted && user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const roleLabel = { admin: 'Quản trị viên', mod: 'Điều hành viên', member: 'Thành viên' };

  return (
    <div className="admin-layout-root">
      <div className="glow-bg-admin"></div>
      <div className="noise-overlay-admin"></div>

      {sidebarOpen && (
        <div className="sidebar-overlay-mobile" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <Link href="/admin" className="sidebar-brand" onClick={() => setSidebarOpen(false)}>
          <span className="logo-icon">🎁</span>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-title">Quà Xinh</div>
            <div className="sidebar-brand-sub">Trang quản trị</div>
          </div>
        </Link>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              if (item.staff && !isStaff) return null;
              return <div key={i} className="sidebar-section-label">{item.section}</div>;
            }
            if (item.staff && !isStaff) return null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="sidebar-user">
          {mounted && user ? (
            <div>
              <div className="sidebar-user-info">
                <div className="sidebar-avatar">{initials}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div className="sidebar-user-name" title={user.displayName}>{user.displayName}</div>
                  <div className="sidebar-user-role">
                    {roleLabel[user.role] || user.role} <span className="tier-tag">{user.tier}</span>
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} disabled={loggingOut} className="btn-logout">
                {loggingOut ? 'Đang đăng xuất...' : '⎋ Đăng xuất'}
              </button>
            </div>
          ) : (
            <div className="sidebar-loading-user">
              <div className="skeleton-line" />
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <button className="sidebar-mobile-toggle-floating" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">☰</button>
        <header className="admin-content-header">
          <h2>{title}</h2>
        </header>
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
