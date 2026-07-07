'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import '@/app/admin/admin.css';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(post) {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, status: newStatus }),
      });
      if (res.ok) {
        loadPosts();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  }

  async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Changelog deleted successfully' });
        loadPosts();
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.error || 'Failed to delete post' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setDeleting(null);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.summary && p.summary.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminShell title="Bài viết & Tin tức">
      {msg && (
        <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>
          {msg.text}
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">📝 Bài viết & Tin tức ({filtered.length})</div>
          <Link href="/admin/posts/new" className="btn btn-primary btn-sm">+ Tạo bài viết</Link>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--admin-border)' }}>
          <div className="adm-toolbar">
            <div className="adm-search-wrap">
              <span className="adm-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm bài viết theo tiêu đề..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="adm-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã đăng</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-muted)' }}>Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty-icon">📄</div>
              <div className="adm-empty-text">Chưa có bài viết nào</div>
              <Link href="/admin/posts/new" className="btn btn-primary" style={{ marginTop: 16 }}>Tạo bài viết đầu tiên</Link>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Trạng thái</th>
                  <th>Lượt xem</th>
                  <th>Ngày đăng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(post => (
                  <tr key={post.id}>
                    <td className="title-cell">
                      <Link href={`/admin/posts/${post.id}`}>{post.title}</Link>
                      <div className="sub">By {post.author_name}</div>
                    </td>
                    <td>
                      <button
                        className={`badge ${post.status === 'published' ? 'badge-green' : 'badge-yellow'}`}
                        style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
                        onClick={() => toggleStatus(post)}
                        title="Bấm để đổi trạng thái"
                      >
                        {post.status === 'published' ? '✓ Published' : '○ Draft'}
                      </button>
                    </td>
                    <td style={{ fontWeight: 600 }}>{(post.views || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--admin-muted)', fontSize: 12 }}>
                      {post.created_at ? new Date(post.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/admin/posts/${post.id}`} className="btn btn-secondary btn-sm btn-icon" title="Edit">✏️</Link>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
                          title="Delete"
                          disabled={deleting === post.id}
                          onClick={() => deletePost(post.id)}
                        >
                          {deleting === post.id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
