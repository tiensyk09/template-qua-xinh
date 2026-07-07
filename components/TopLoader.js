'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Thanh loading mảnh chạy ngang trên cùng khi chuyển trang (kiểu NProgress).
// Tự viết, không phụ thuộc thư viện. Dùng cho cả frontend lẫn admin.
export default function TopLoader({ color = '#c9a24b', height = 3 }) {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickle = useRef(null);
  const finishT = useRef(null);
  const safety = useRef(null);
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    started.current = true;
    clearTimeout(finishT.current);
    setVisible(true);
    setProgress(8);
    clearInterval(trickle.current);
    trickle.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        const inc = p < 40 ? 9 : p < 70 ? 4 : p < 85 ? 2 : 0.6;
        return Math.min(92, p + inc);
      });
    }, 240);
    clearTimeout(safety.current);
    safety.current = setTimeout(complete, 10000); // an toàn: tự tắt nếu kẹt
  };

  const complete = () => {
    if (!started.current) return;
    started.current = false;
    clearInterval(trickle.current);
    clearTimeout(safety.current);
    setProgress(100);
    clearTimeout(finishT.current);
    finishT.current = setTimeout(() => { setVisible(false); setProgress(0); }, 360);
  };

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      let url;
      try { url = new URL(a.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    };
    document.addEventListener('click', onClick, true);

    const origPush = history.pushState;
    history.pushState = function (...args) { start(); return origPush.apply(this, args); };
    const onPop = () => start();
    window.addEventListener('popstate', onPop);

    return () => {
      document.removeEventListener('click', onClick, true);
      history.pushState = origPush;
      window.removeEventListener('popstate', onPop);
      clearInterval(trickle.current);
      clearTimeout(finishT.current);
      clearTimeout(safety.current);
    };
  }, []);

  // Khi route mới đã commit (pathname đổi) -> hoàn tất thanh
  useEffect(() => { complete(); }, [pathname]);

  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height, zIndex: 99999, pointerEvents: 'none' }}>
      <div style={{
        height: '100%',
        width: progress + '%',
        background: color,
        opacity: progress >= 100 ? 0 : 1,
        transition: 'width 0.24s ease-out, opacity 0.35s ease',
        boxShadow: `0 0 10px ${color}, 0 0 5px ${color}`,
        borderRadius: '0 3px 3px 0',
      }} />
    </div>
  );
}
