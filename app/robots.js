import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// /robots.txt — trỏ tới sitemap, chặn admin/api khỏi index
export default async function robots() {
  let base = 'https://localhost';
  try {
    const h = await headers();
    const host = h.get('host') || 'localhost';
    const proto = h.get('x-forwarded-proto') || 'https';
    base = `${proto}://${host}`;
  } catch { /* fallback */ }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/login', '/register', '/cart', '/checkout'] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
