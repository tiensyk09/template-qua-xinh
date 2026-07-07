'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHead } from '@/components/CategoryGrid';

const BROWN = '#ef7d9c';
const ESPRESSO = '#4a2a38';

export default function BlogGrid() {
  const [posts, setPosts] = useState([]);

  const fallbackPosts = [
    { id: 1, title: 'Gợi ý 10 món quà sinh nhật ý nghĩa cho bạn thân', date: '20/05/2024', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80', slug: 'goi-y-qua-sinh-nhat-y-nghia' },
    { id: 2, title: 'Hướng dẫn gói quà xinh xắn tại nhà cực đơn giản', date: '18/05/2024', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80', slug: 'huong-dan-goi-qua-xinh-tai-nha' },
    { id: 3, title: 'Top phụ kiện thời trang hot trend năm nay', date: '15/05/2024', image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80', slug: 'top-phu-kien-thoi-trang-hot-trend' },
  ];

  useEffect(() => {
    fetch('/api/posts?status=published&limit=3')
      .then(res => res.json())
      .then(data => {
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts.map(p => ({
            id: p.id,
            title: p.title,
            date: p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : 'Mới nhất',
            image: p.image,
            slug: p.slug
          })));
        } else setPosts(fallbackPosts);
      })
      .catch(() => setPosts(fallbackPosts));
  }, []);

  return (
    <section style={{ backgroundColor: '#fef6f9', padding: '48px 0' }}>
      <div className="container mx-auto px-4">
        <SectionHead icon="📝" title="Bài viết mới nhất" href="/blog" k="sec_blog" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }} className="cf-blog-grid">
          {posts.map((post) => (
            <div key={post.id} className="cf-blog-card" style={{ backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #fce7ee', display: 'flex', flexDirection: 'column', transition: 'all 0.3s' }}>
              <Link href={`/posts/${post.slug}`} style={{ display: 'block', height: 190, overflow: 'hidden', backgroundColor: '#fceaf0' }}>
                <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'; }} />
              </Link>
              <div style={{ padding: '18px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11.5, color: '#a3947f', fontWeight: 600, marginBottom: 8 }}>{post.date}</div>
                <Link href={`/posts/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: ESPRESSO, lineHeight: 1.45, marginBottom: 14 }}>{post.title}</h3>
                </Link>
                <Link href={`/posts/${post.slug}`} style={{ marginTop: 'auto', fontSize: 12, fontWeight: 800, color: BROWN, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Đọc thêm
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12 H20 M14 6 L20 12 L14 18" /></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .cf-blog-card:hover { box-shadow: 0 16px 34px rgba(59,42,32,0.12); transform: translateY(-4px); }
        .cf-blog-card:hover img { transform: scale(1.05); }
        @media (max-width: 900px) { .cf-blog-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
