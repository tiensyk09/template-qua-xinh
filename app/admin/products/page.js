'use client';
import { useState, useEffect, useRef } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import '@/app/admin/admin.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  
  // Image upload and select states
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  
  const sampleImages = [
    { name: 'Móc khóa xinh xắn', url: 'https://images.unsplash.com/photo-1513116476489-7635e79feb27' },
    { name: 'Hộp quà tặng', url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48' },
    { name: 'Phụ kiện thời trang', url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d' },
    { name: 'Văn phòng phẩm dễ thương', url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc' }
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataUrl: base64,
            filename: file.name
          })
        });
        if (res.ok) {
          const data = await res.json();
          setForm(prev => ({ ...prev, thumbnail: data.url }));
          setMsg({ type: 'success', text: 'Tải ảnh lên thành công!' });
        } else {
          const err = await res.json();
          setMsg({ type: 'error', text: err.error || 'Tải ảnh thất bại' });
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setMsg({ type: 'error', text: 'Lỗi tải ảnh lên' });
    } finally {
      setUploading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };
  
  // Search and filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    short_description: '',
    description: '',
    price: 0,
    original_price: '',
    thumbnail: '',
    brand: '',
    origin: '',
    unit: 'Hộp',
    stock: 0,
    is_featured: false,
    is_flash_sale: false,
    flash_sale_price: '',
    status: 'active'
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [categoryFilter]);

  async function loadCategories() {
    try {
      const res = await fetch('/api/shop-categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const url = `/api/products?limit=50&show_all=true&category=${categoryFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      } else {
        setMsg({ type: 'error', text: 'Không thể tải danh sách sản phẩm' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      category_id: categories[0]?.id || '',
      short_description: '',
      description: '',
      price: 0,
      original_price: '',
      thumbnail: '',
      brand: '',
      origin: '',
      unit: 'Hộp',
      stock: 50,
      is_featured: false,
      is_flash_sale: false,
      flash_sale_price: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setForm({
      name: prod.name,
      category_id: prod.category_id || '',
      short_description: prod.short_description || '',
      description: prod.description || '',
      price: prod.price,
      original_price: prod.original_price || '',
      thumbnail: prod.thumbnail || '',
      brand: prod.brand || '',
      origin: prod.origin || '',
      unit: prod.unit || 'Hộp',
      stock: prod.stock || 0,
      is_featured: !!prod.is_featured,
      is_flash_sale: !!prod.is_flash_sale,
      flash_sale_price: prod.flash_sale_price || '',
      status: prod.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    // Kiểm tra trùng tên trên client-side (với danh sách sản phẩm hiện tại)
    const nameToCheck = form.name.trim().toLowerCase();
    const isDuplicateName = products.some(p => 
      p.name.trim().toLowerCase() === nameToCheck && (!editingProduct || p.id !== editingProduct.id)
    );
    if (isDuplicateName) {
      setMsg({ type: 'error', text: 'Tên sản phẩm đã tồn tại trong danh sách' });
      setTimeout(() => setMsg(null), 3000);
      return;
    }

    setSaving(true);
    const isEdit = !!editingProduct;
    const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const fallbackImage = 'https://images.unsplash.com/photo-1513116476489-7635e79feb27';
      const finalThumbnail = form.thumbnail && form.thumbnail.trim() !== '' ? form.thumbnail.trim() : fallbackImage;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          thumbnail: finalThumbnail,
          price: parseFloat(form.price),
          original_price: form.original_price ? parseFloat(form.original_price) : null,
          flash_sale_price: form.flash_sale_price ? parseFloat(form.flash_sale_price) : null,
          stock: parseInt(form.stock)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: isEdit ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công' });
        setIsModalOpen(false);
        loadProducts();
      } else {
        setMsg({ type: 'error', text: data.error || 'Thao tác thất bại' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Xóa sản phẩm thành công' });
        loadProducts();
      } else {
        setMsg({ type: 'error', text: 'Xóa sản phẩm thất bại' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <AdminShell title="Quản lý Sản phẩm">
      {msg && (
        <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>
          {msg.text}
        </div>
      )}

      {/* Toolbar controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '500px' }}>
          <input
            type="text"
            className="adm-filter-select"
            placeholder="Tìm theo tên sản phẩm, thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '6px' }}
          />
          <select
            className="adm-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '8px 12px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '6px' }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-secondary">Tìm</button>
        </form>

        <button onClick={openAddModal} className="btn btn-primary">
          ➕ Thêm sản phẩm mới
        </button>
      </div>

      {/* Main product table */}
      <div className="adm-card">
        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>Đang tải danh sách...</div>
          ) : products.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty-icon">🛍️</div>
              <div className="adm-empty-text">Không tìm thấy sản phẩm nào</div>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Thương hiệu</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th>Nổi bật</th>
                  <th>Flash Sale</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <img
                        src={prod.thumbnail || '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png'}
                        alt={prod.name}
                        style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid #3f3f46', borderRadius: '4px', background: '#fff' }}
                        onError={(e) => { e.target.src = 'https://picsum.photos/40/40'; }}
                      />
                    </td>
                    <td style={{ fontWeight: '600', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={prod.name}>
                      {prod.name}
                    </td>
                    <td>{prod.brand || '—'}</td>
                    <td style={{ color: 'var(--admin-primary)', fontWeight: 700 }}>
                      {prod.price.toLocaleString('vi-VN')}đ / {prod.unit || 'Hộp'}
                    </td>
                    <td>{prod.stock}</td>
                    <td>
                      <span className={`badge ${prod.is_featured ? 'badge-green' : 'badge-yellow'}`}>
                        {prod.is_featured ? 'Có' : 'Không'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${prod.is_flash_sale ? 'badge-green' : 'badge-yellow'}`}>
                        {prod.is_flash_sale ? `Có (${prod.flash_sale_price?.toLocaleString('vi-VN')}đ)` : 'Không'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${prod.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                        {prod.status === 'active' ? 'Bán' : 'Ẩn'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEditModal(prod)} title="Sửa">✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(prod.id)} title="Xóa">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="adm-modal-container" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--admin-text)', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px', marginBottom: '20px' }}>
              {editingProduct ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="adm-grid-2-1">
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Danh mục *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="adm-grid-4">
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Thương hiệu</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Xuất xứ</label>
                  <input
                    type="text"
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Đơn vị tính</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '8px' }}
                    placeholder="Hộp, Vỉ, Chai..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Tồn kho</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div className="adm-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Giá bán *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Giá gốc (so sánh)</label>
                  <input
                    type="number"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '8px' }}
                  />
                </div>
                <div />
              </div>

              {/* Advanced Image Upload layout */}
              <div className="adm-grid-2-1" style={{ alignItems: 'flex-start' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Ảnh sản phẩm (URL)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={form.thumbnail}
                      onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                      style={{ flex: 1, padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '8px' }}
                      placeholder="Dán link ảnh hoặc tải lên..."
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      style={{ padding: '10px 14px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {uploading ? '⏳ Tải...' : '📤 Tải ảnh'}
                    </button>
                  </div>
                  
                  {/* Sample selection */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Chọn nhanh ảnh mẫu:</span>
                    {sampleImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setForm({ ...form, thumbnail: img.url })}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          background: form.thumbnail === img.url ? 'var(--admin-primary-glow)' : '#f1f5f9',
                          color: form.thumbnail === img.url ? 'var(--admin-primary)' : 'var(--admin-text)',
                          border: `1px solid ${form.thumbnail === img.url ? 'var(--admin-primary)' : '#cbd5e1'}`,
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {img.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px', background: '#f8fafc', minHeight: '110px' }}>
                  {form.thumbnail ? (
                    <div style={{ position: 'relative', width: '100%', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={form.thumbnail}
                        alt="Preview"
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }}
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Loi+anh'; }}
                      />
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--admin-muted)', textAlign: 'center', lineHeight: '1.4' }}>Chưa có ảnh<br/>(Tự động thay bằng ảnh quà tặng mặc định)</span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Mô tả ngắn</label>
                <input
                  type="text"
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Mô tả chi tiết (HTML)</label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '8px', resize: 'vertical' }}
                />
              </div>

              <div className="adm-grid-4" style={{ alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--admin-text)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  />
                  Sản phẩm nổi bật
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--admin-text)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={form.is_flash_sale}
                    onChange={(e) => setForm({ ...form, is_flash_sale: e.target.checked })}
                  />
                  Flash sale hoạt động
                </label>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>Giá Flash sale</label>
                  <input
                    type="number"
                    disabled={!form.is_flash_sale}
                    value={form.flash_sale_price}
                    onChange={(e) => setForm({ ...form, flash_sale_price: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--admin-text)', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <option value="active">Bán công khai (Active)</option>
                    <option value="draft">Ẩn lưu trữ (Draft)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--admin-border)', paddingTop: '16px', marginTop: '10px' }}>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" disabled={saving}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                  )}
                  {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
