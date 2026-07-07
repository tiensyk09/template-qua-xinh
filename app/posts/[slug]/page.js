import Link from 'next/link';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import PostSidebarClient from '@/components/PostSidebarClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const articles = await query("SELECT * FROM posts WHERE slug = ? AND status = 'published'", [slug]);
  const article = articles[0];
  if (!article) return { title: 'Bài viết không tìm thấy | Quà Xinh' };

  const siteTitleRow = await query('SELECT `value` FROM settings WHERE `key` = ?', ['site_title']);
  const siteTitleSuffix = siteTitleRow[0]?.value || 'Quà Xinh';

  return {
    title: article.meta_title || `${article.title} | ${siteTitleSuffix}`,
    description: article.meta_description || article.summary || article.content?.replace(/<[^>]*>/g, '').substring(0, 150) || '',
    keywords: article.meta_keywords || ''
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const articles = await query("SELECT * FROM posts WHERE slug = ? AND status = 'published'", [slug]);
  const article = articles[0];
  if (!article) notFound();

  // Increment views
  try {
    await query('UPDATE posts SET views = views + 1 WHERE id = ?', [article.id]);
  } catch (err) {
    console.error('Failed to update views count:', err);
  }

  const recentUpdates = await query(
    "SELECT id, title, slug, image, created_at FROM posts WHERE status = 'published' AND id != ? ORDER BY created_at DESC LIMIT 5",
    [article.id]
  );

  let suggestedProducts = [];
  try {
    const productsPool = await query(
      "SELECT id, name, slug, price, original_price, thumbnail, unit FROM products ORDER BY id DESC LIMIT 12"
    );
    if (productsPool && productsPool.length > 0) {
      suggestedProducts = [...productsPool].sort(() => 0.5 - Math.random()).slice(0, 3);
    }
  } catch (err) {
    console.error('Failed to fetch suggested products:', err);
  }

  return (
    <div style={{ backgroundColor: '#fef4f8', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>

        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 0', fontSize: '13px', color: '#6b7280' }}>
          <Link href="/" style={{ color: '#374151', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <Link href="/posts" style={{ color: '#374151', textDecoration: 'none' }}>Cẩm nang quà tặng</Link>
          <span>/</span>
          <span style={{ color: '#b85c78', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
            {article.title}
          </span>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', paddingBottom: '60px' }}
          className="post-detail-grid">

          {/* Main article */}
          <main style={{ minWidth: 0, backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <article>
              {/* Category badge */}
              <span style={{ display: 'inline-block', background: '#fceaf0', color: '#b85c78', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                Cẩm Nang Quà Tặng
              </span>

              {/* Title */}
              <h1 style={{ fontSize: '26px', fontWeight: 800, lineHeight: '1.4', marginBottom: '16px', color: '#4a2a38', letterSpacing: '-0.02em' }}>
                {article.title}
              </h1>

              {/* Meta bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12.5px', color: '#6b7280', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', flexWrap: 'wrap' }}>
                <span>📅 {new Date(article.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span>•</span>
                <span>👤 {article.author_name || 'Quà Xinh'}</span>
                <span>•</span>
                <span>👁️ {(article.views + 1).toLocaleString()} lượt xem</span>
              </div>

              {/* Featured image */}
              {article.image && (
                <div style={{ width: '100%', maxHeight: '420px', overflow: 'hidden', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '28px' }}>
                  <img src={article.image} alt={article.title} style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover', display: 'block' }} />
                </div>
              )}

              {/* Summary box */}
              {article.summary && (
                <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', borderLeft: '4px solid #b85c78', backgroundColor: '#fdeef5', padding: '16px 20px', borderRadius: '0 8px 8px 0', marginBottom: '28px', fontStyle: 'italic', fontWeight: 500 }}>
                  {article.summary}
                </div>
              )}

              {/* Content */}
              <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
            </article>
          </main>

          {/* Sidebar */}
          <PostSidebarClient recentUpdates={recentUpdates} suggestedProducts={suggestedProducts} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          .post-detail-grid { grid-template-columns: 1fr !important; }
        }
        .article-content { color: #374151; font-size: 15.5px; line-height: 1.85; }
        .article-content p { margin-bottom: 20px; }
        .article-content h2 { color: #4a2a38; font-size: 20px; font-weight: 700; margin: 32px 0 12px; }
        .article-content h3 { color: #374151; font-size: 17px; font-weight: 700; margin: 28px 0 10px; }
        .article-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 24px 0; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
        .article-content ul { list-style-type: disc; margin-left: 24px; margin-bottom: 20px; }
        .article-content ol { list-style-type: decimal; margin-left: 24px; margin-bottom: 20px; }
        .article-content li { margin-bottom: 8px; }
        .article-content strong { color: #4a2a38; font-weight: 600; }
        .article-content blockquote { border-left: 4px solid #b85c78; background-color: #fdeef5; padding: 12px 18px; margin: 20px 0; border-radius: 4px; font-style: italic; }
        .post-sidebar-hover:hover { color: #b85c78 !important; }
      `}} />
    </div>
  );
}
