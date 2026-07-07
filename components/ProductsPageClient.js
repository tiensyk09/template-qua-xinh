'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';

export default function ProductsPageClient({
  categories = [],
  products = [],
  activeCategory = null,
  searchQ = '',
  sort = 'newest',
  pagination = {}
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState(null);

  // Filter States
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  
  // Mobile Filter Drawer Toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(window.location.search);
    params.set('sort', newSort);
    params.set('page', '1'); // reset page
    router.push(`/products?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setPriceFilter('all');
    setRatingFilter('all');
    router.push('/products');
  };

  const handleAddToCart = (product) => {
    setAddingId(product.id);
    addItem(product, null, 1);
    setTimeout(() => {
      setAddingId(null);
    }, 800);
  };

  // Client-side filtering logic
  const filteredProducts = products.filter(prod => {
    // Price Filter
    if (priceFilter === 'under-500' && prod.price >= 500000) return false;
    if (priceFilter === '500-1000' && (prod.price < 500000 || prod.price > 1000000)) return false;
    if (priceFilter === '1000-2000' && (prod.price < 1000000 || prod.price > 2000000)) return false;
    if (priceFilter === 'over-2000' && prod.price <= 2000000) return false;

    // Rating Filter
    const productRating = prod.rating || 5;
    if (ratingFilter === '5' && productRating < 5) return false;
    if (ratingFilter === '4' && productRating < 4) return false;
    if (ratingFilter === '3' && productRating < 3) return false;

    return true;
  });

  return (
    <div style={{ backgroundColor: '#fef4f8', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumbs */}
        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#374151', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <Link href="/products" style={{ color: '#374151', textDecoration: 'none' }}>Sản phẩm</Link>
          {activeCategory && (
            <>
              <span>/</span>
              <span style={{ color: '#b85c78', fontWeight: 600 }}>{activeCategory.name}</span>
            </>
          )}
          {searchQ && (
            <>
              <span>/</span>
              <span style={{ color: '#6b7280' }}>Tìm kiếm: "{searchQ}"</span>
            </>
          )}
        </div>

        {/* MOBILE ONLY: Horizontal Scrollable Categories */}
        <div className="lc-mobile-categories-scroll" style={{ display: 'none', gap: '8px', overflowX: 'auto', paddingBottom: '16px', margin: '0 -20px 16px -20px', paddingLeft: '20px', paddingRight: '20px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          <Link
            href="/products"
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              background: !activeCategory ? '#b85c78' : '#ffffff',
              color: !activeCategory ? '#ffffff' : '#374151',
              border: '1px solid ' + (!activeCategory ? '#b85c78' : '#e5e7eb'),
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
          >
            🎁 Tất cả
          </Link>
          {categories.map((cat) => {
            const isActive = activeCategory?.slug === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}${searchQ ? `&q=${encodeURIComponent(searchQ)}` : ''}`}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  background: isActive ? '#b85c78' : '#ffffff',
                  color: isActive ? '#ffffff' : '#374151',
                  border: '1px solid ' + (isActive ? '#b85c78' : '#e5e7eb'),
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                {cat.icon || '📦'} {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Two-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px' }} className="products-layout-grid">
          
          {/* DESKTOP SIDEBAR: FILTERS */}
          <aside className="lc-desktop-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignSelf: 'start' }}>
            
            {/* Filter Section 1: Categories */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '16px', color: '#4a2a38', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📂</span> Danh Mục Sản Phẩm
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>
                  <Link
                    href="/products"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '13.5px',
                      color: !activeCategory ? '#ffffff' : '#374151',
                      background: !activeCategory ? '#b85c78' : 'transparent',
                      fontWeight: !activeCategory ? 700 : 500,
                      transition: 'all 0.2s'
                    }}
                    className={activeCategory ? "category-link-hover" : ""}
                  >
                    <span>🎁 Tất cả sản phẩm</span>
                  </Link>
                </li>
                {categories.map((cat) => {
                  const isActive = activeCategory?.slug === cat.slug;
                  return (
                    <li key={cat.id}>
                      <Link
                        href={`/products?category=${cat.slug}${searchQ ? `&q=${encodeURIComponent(searchQ)}` : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '13.5px',
                          color: isActive ? '#ffffff' : '#374151',
                          background: isActive ? '#b85c78' : 'transparent',
                          fontWeight: isActive ? 700 : 500,
                          transition: 'all 0.2s'
                        }}
                        className={!isActive ? "category-link-hover" : ""}
                      >
                        <span>{cat.icon || '📦'} {cat.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Filter Section 2: Price range */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '16px', color: '#4a2a38', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💰</span> Khoảng Giá (VND)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { value: 'all', label: 'Tất cả mức giá' },
                  { value: 'under-500', label: 'Dưới 500.000đ' },
                  { value: '500-1000', label: '500k - 1.000.000đ' },
                  { value: '1000-2000', label: '1M - 2.000.000đ' },
                  { value: 'over-2000', label: 'Trên 2.000.000đ' }
                ].map((opt) => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#4b5563', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="priceFilter"
                      value={opt.value}
                      checked={priceFilter === opt.value}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      style={{ accentColor: '#b85c78', width: '16px', height: '16px' }}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Section 3: Star ratings */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '16px', color: '#4a2a38', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⭐</span> Đánh Giá
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { value: 'all', label: 'Tất cả đánh giá' },
                  { value: '5', label: '⭐⭐⭐⭐⭐ 5 Sao' },
                  { value: '4', label: '⭐⭐⭐⭐☆ Từ 4 Sao' },
                  { value: '3', label: '⭐⭐⭐☆☆ Từ 3 Sao' }
                ].map((opt) => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#4b5563', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="ratingFilter"
                      value={opt.value}
                      checked={ratingFilter === opt.value}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      style={{ accentColor: '#b85c78', width: '16px', height: '16px' }}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* RIGHT COLUMN: PRODUCTS LIST */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Toolbar */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '14.5px', color: '#374151', fontWeight: 500 }}>
                Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
                {(activeCategory || searchQ || priceFilter !== 'all' || ratingFilter !== 'all') && (
                  <span
                    onClick={clearFilters}
                    style={{ marginLeft: '12px', color: '#d97706', fontWeight: 700, cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    ✕ Xóa bộ lọc
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                
                {/* MOBILE ONLY: Toggle filters drawer button */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lc-mobile-filter-btn"
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1.5px solid ' + (showMobileFilters ? '#b85c78' : '#e5e7eb'),
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: showMobileFilters ? '#fceaf0' : '#ffffff',
                    color: showMobileFilters ? '#b85c78' : '#374151'
                  }}
                >
                  ⚙️ Bộ lọc {(priceFilter !== 'all' || ratingFilter !== 'all') && '•'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13.5px', color: '#6b7280' }} className="lc-desktop-sort-lbl">Sắp xếp:</span>
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1.5px solid #e5e7eb',
                      fontSize: '13.5px',
                      outline: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: '#374151',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá tăng dần</option>
                    <option value="price_desc">Giá giảm dần</option>
                    <option value="popular">Bán chạy nhất</option>
                  </select>
                </div>
              </div>
            </div>

            {/* MOBILE ONLY: Collapsible Filters Panel */}
            {showMobileFilters && (
              <div
                className="lc-mobile-filters-drawer"
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1.5px solid #b85c78',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  boxShadow: '0 4px 20px rgba(13, 104, 50, 0.08)',
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="lc-mobile-filters-grid">
                  
                  {/* Price filter column */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#4a2a38', margin: '0 0 12px 0' }}>Khoảng giá</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { value: 'all', label: 'Tất cả mức giá' },
                        { value: 'under-500', label: 'Dưới 500.000đ' },
                        { value: '500-1000', label: '500k - 1M' },
                        { value: '1000-2000', label: '1M - 2M' },
                        { value: 'over-2000', label: 'Trên 2M' }
                      ].map((opt) => (
                        <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563' }}>
                          <input
                            type="radio"
                            name="priceFilterMobile"
                            value={opt.value}
                            checked={priceFilter === opt.value}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            style={{ accentColor: '#b85c78' }}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating filter column */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#4a2a38', margin: '0 0 12px 0' }}>Đánh giá</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { value: 'all', label: 'Tất cả đánh giá' },
                        { value: '5', label: '⭐⭐⭐⭐⭐ 5 Sao' },
                        { value: '4', label: '⭐⭐⭐⭐☆ Từ 4 Sao' },
                        { value: '3', label: '⭐⭐⭐☆☆ Từ 3 Sao' }
                      ].map((opt) => (
                        <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563' }}>
                          <input
                            type="radio"
                            name="ratingFilterMobile"
                            value={opt.value}
                            checked={ratingFilter === opt.value}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            style={{ accentColor: '#b85c78' }}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Confirm buttons */}
                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    style={{ flex: 1, padding: '8px', background: '#b85c78', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Áp dụng bộ lọc
                  </button>
                  <button
                    onClick={() => { clearFilters(); setShowMobileFilters(false); }}
                    style={{ padding: '8px 16px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '20px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Xóa hết
                  </button>
                </div>

              </div>
            )}

            {/* Grid */}
            {filteredProducts.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '80px 20px', textAlign: 'center', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#4a2a38', marginBottom: '8px' }}>Không tìm thấy sản phẩm nào</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px 0' }}>Vui lòng thay đổi khoảng giá, đánh giá hoặc danh mục để tìm thấy sản phẩm.</p>
                <button
                  onClick={clearFilters}
                  style={{ background: '#b85c78', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px' }}
                >
                  Xóa bộ lọc để quay lại
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '24px' }} className="lc-products-list-grid">
                  {filteredProducts.map((prod) => {
                    const discountPercent = prod.original_price
                      ? Math.round(((prod.original_price - prod.price) / prod.original_price) * 100)
                      : 0;

                    return (
                      <div
                        key={prod.id}
                        className="product-card-hover"
                        style={{
                          background: '#ffffff',
                          borderRadius: '16px',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.2s'
                        }}
                      >
                        {discountPercent > 0 && (
                          <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, background: '#ea580c', color: '#fff', fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                            -{discountPercent}%
                          </div>
                        )}
                        
                        <Link href={`/products/${prod.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '16px' }}>
                          {/* Image wrapper */}
                          <div style={{ width: '100%', height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                            <img
                              src={prod.thumbnail || 'https://picsum.photos/160/160?random=' + prod.id}
                              alt={prod.name}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.src = 'https://picsum.photos/160/160?random=' + prod.id;
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div style={{ minHeight: '84px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              {prod.brand && (
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#b85c78', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                                  {prod.brand}
                                </span>
                              )}
                              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#4a2a38', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: '1.45' }}>
                                {prod.name}
                              </h4>
                            </div>
                          </div>

                          {/* Price & original price */}
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '15px', fontWeight: 800, color: '#b85c78' }}>
                                {prod.price.toLocaleString('vi-VN')}đ
                              </span>
                              <span style={{ fontSize: '11.5px', color: '#6b7280' }}>
                                / {prod.unit || 'Hộp'}
                              </span>
                            </div>
                            {prod.original_price && prod.original_price > prod.price && (
                              <div style={{ fontSize: '11.5px', color: '#9ca3af', textDecoration: 'line-through', marginTop: '2px' }}>
                                {prod.original_price.toLocaleString('vi-VN')}đ
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Action select button */}
                        <div style={{ padding: '0 16px 16px', marginTop: 'auto' }}>
                          <button
                            onClick={() => handleAddToCart(prod)}
                            disabled={addingId === prod.id}
                            style={{
                              width: '100%',
                              padding: '9px',
                              borderRadius: '24px',
                              border: 'none',
                              background: addingId === prod.id ? '#ef7d9c' : '#fceaf0',
                              color: addingId === prod.id ? '#ffffff' : '#b85c78',
                              fontWeight: 700,
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                            className={addingId !== prod.id ? "buy-btn-hover" : ""}
                          >
                            {addingId === prod.id ? '✓ Đã thêm!' : 'Chọn mua'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        background: '#ffffff',
                        cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                        opacity: pagination.page === 1 ? 0.5 : 1,
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#374151'
                      }}
                    >
                      « Trước
                    </button>
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      const isCurrent = pagination.page === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: isCurrent ? 'none' : '1px solid #e5e7eb',
                            background: isCurrent ? '#b85c78' : '#ffffff',
                            color: isCurrent ? '#ffffff' : '#374151',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        background: '#ffffff',
                        cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                        opacity: pagination.page === pagination.totalPages ? 0.5 : 1,
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#374151'
                      }}
                    >
                      Sau »
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .products-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .lc-desktop-sidebar {
            display: none !important;
          }
          .lc-mobile-categories-scroll {
            display: flex !important;
          }
          .lc-mobile-filter-btn {
            display: inline-flex !important;
          }
          .lc-desktop-sort-lbl {
            display: none !important;
          }
          .lc-products-list-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 480px) {
          .lc-mobile-filters-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        .category-link-hover:hover {
          background-color: #fdeef5 !important;
          color: #b85c78 !important;
        }
        .product-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(13, 104, 50, 0.05);
          border-color: #b85c78 !important;
        }
        .buy-btn-hover:hover {
          background-color: #b85c78 !important;
          color: #ffffff !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
