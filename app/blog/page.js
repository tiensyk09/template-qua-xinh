'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BlogIndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/posts?status=published&limit=50')
      .then(res => res.ok ? res.json() : { posts: [] })
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.summary && post.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ backgroundColor: '#fef4f8', minHeight: '100vh', padding: '40px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: '#6b7280' }}>
          <Link href="/" style={{ color: '#374151', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <span style={{ color: '#b85c78', fontWeight: 600 }}>Cẩm nang quà tặng</span>
        </div>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#4a2a38', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Tin Tức & Cẩm Nang Quà Tặng
          </h1>
          <p style={{ color: '#4b5563', fontSize: '15px', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Gợi ý quà tặng theo dịp, cách gói quà đáng yêu và cập nhật hot trend phụ kiện xinh xắn dành cho bạn.
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 20px 12px 48px',
                borderRadius: '999px',
                border: '1.5px solid #e5e7eb',
                fontSize: '14px',
                outline: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                backgroundColor: '#ffffff'
              }}
            />
            <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#9ca3af' }}>
              🔍
            </span>
          </div>
        </div>

        {/* Grid of posts */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
            <div className="lc-spinner" style={{ margin: '0 auto 16px' }}></div>
            <div>Đang tải bài viết...</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#4a2a38', marginBottom: '8px' }}>Không tìm thấy bài viết nào</h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Vui lòng thử lại với từ khóa khác.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                className="blog-card-hover"
              >
                {/* Thumbnail */}
                <Link href={`/posts/${post.slug}`} style={{ display: 'block', height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={post.image || 'https://picsum.photos/400/250?random=' + post.id}
                    alt={post.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    className="blog-card-img"
                    onError={(e) => {
                      e.target.src = 'https://picsum.photos/400/250?random=' + post.id;
                    }}
                  />
                </Link>

                {/* Content */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Category badge & Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#b85c78', background: '#fceaf0', padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase' }}>
                      Cẩm nang
                    </span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      📅 {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.4, color: '#4a2a38', margin: '0 0 12px 0' }}>
                    <Link href={`/posts/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }} className="blog-title-hover">
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.55, margin: '0 0 20px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                    {post.summary || (post.content || '').replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
                  </p>

                  {/* Footer metadata */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: 500 }}>
                      👤 {post.author_name || 'Quà Xinh'}
                    </span>
                    <Link href={`/posts/${post.slug}`} style={{ fontSize: '13px', fontWeight: 700, color: '#b85c78', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Xem chi tiết <span style={{ transition: 'transform 0.2s' }} className="read-more-arrow">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .blog-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(13, 104, 50, 0.08) !important;
        }
        .blog-card-hover:hover .blog-card-img {
          transform: scale(1.05);
        }
        .blog-card-hover:hover .read-more-arrow {
          transform: translateX(4px);
        }
        .blog-title-hover:hover {
          color: #b85c78 !important;
        }
        .lc-spinner {
          width: 40px;
          height: 40px;
          border: 3.5px solid #fceaf0;
          border-top-color: #b85c78;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
