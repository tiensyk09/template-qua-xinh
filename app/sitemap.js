import { headers } from 'next/headers';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// /sitemap.xml — tự sinh, chuẩn Google Search Console.
// Tự nhận domain qua header (chạy đúng trên workers.dev lẫn domain riêng).
export default async function sitemap() {
  let base = 'https://localhost';
  try {
    const h = await headers();
    const host = h.get('host') || 'localhost';
    const proto = h.get('x-forwarded-proto') || 'https';
    base = `${proto}://${host}`;
  } catch { /* build-time fallback */ }

  const now = new Date();
  const staticPaths = [
    { p: '', pr: 1.0, cf: 'daily' },
    { p: '/products', pr: 0.9, cf: 'daily' },
    { p: '/blog', pr: 0.7, cf: 'weekly' },
    { p: '/about', pr: 0.5, cf: 'monthly' },
    { p: '/contact', pr: 0.5, cf: 'monthly' },
  ];
  const routes = staticPaths.map(s => ({ url: `${base}${s.p}`, lastModified: now, changeFrequency: s.cf, priority: s.pr }));

  // Sản phẩm
  try {
    const rows = await query("SELECT slug FROM products WHERE status = 'active'");
    for (const r of (rows || [])) if (r.slug) routes.push({ url: `${base}/products/${r.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 });
  } catch { /* bỏ qua nếu bảng chưa có */ }

  // Bài viết
  try {
    const rows = await query("SELECT slug FROM posts WHERE status = 'published'");
    for (const r of (rows || [])) if (r.slug) routes.push({ url: `${base}/posts/${r.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 });
  } catch { /* bỏ qua */ }

  // Trang tùy chỉnh (Page Builder)
  try {
    const rows = await query("SELECT slug FROM pages WHERE status = 'published'");
    for (const r of (rows || [])) if (r.slug) routes.push({ url: `${base}/${r.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 });
  } catch { /* bỏ qua */ }

  return routes;
}
