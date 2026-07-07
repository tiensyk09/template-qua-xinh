'use client';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LiveEditorProvider } from '@/components/LiveEditor';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Conditionally hide header and footer for admin pages
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <div className="admin-layout-root-container">{children}</div>;
  }

  return (
    <LiveEditorProvider>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </LiveEditorProvider>
  );
}
