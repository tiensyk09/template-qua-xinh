'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import '@/app/admin/admin.css';

export default function AdminPluginsPage() {
  const [plugins, setPlugins] = useState([]);
  const [installed, setInstalled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showStore, setShowStore] = useState(false);
  const [category, setCategory] = useState('all');
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [configValues, setConfigValues] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchPlugins();
  }, []);

  async function fetchPlugins() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/plugins');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch plugins');
      setPlugins(data.plugins || []);
      setInstalled(data.installed || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3000);
  }

  const isInstalled = (pluginId) => {
    return installed.some(ip => ip.id === pluginId);
  };

  const getInstalledRecord = (pluginId) => {
    return installed.find(ip => ip.id === pluginId);
  };

  async function handleInstall(plugin) {
    // Nếu plugin yêu cầu cấu hình, mở modal config trước
    if (plugin.requiresConfig && plugin.requiresConfig.length > 0) {
      setSelectedPlugin(plugin);
      const initialConfig = {};
      plugin.requiresConfig.forEach(field => {
        initialConfig[field.key] = field.default || '';
      });
      setConfigValues(initialConfig);
      setModalOpen(true);
      return;
    }

    await executeAction('install', plugin.id, {});
  }

  async function handleUninstall(pluginId) {
    if (!confirm('Bạn có chắc chắn muốn gỡ cài đặt plugin này không?')) return;
    await executeAction('uninstall', pluginId);
  }

  async function handleConfigureClick(plugin) {
    setSelectedPlugin(plugin);
    const record = getInstalledRecord(plugin.id);
    const currentConfig = record ? record.config : {};
    
    const initialConfig = {};
    (plugin.requiresConfig || []).forEach(field => {
      initialConfig[field.key] = currentConfig[field.key] || field.default || '';
    });
    setConfigValues(initialConfig);
    setModalOpen(true);
  }

  async function executeAction(action, pluginId, config = null) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/plugins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, pluginId, config })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      
      showToast(action === 'install' ? '✅ Đã cài đặt plugin thành công!' : '🗑️ Đã gỡ cài đặt plugin!');
      setModalOpen(false);
      await fetchPlugins();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveConfig(e) {
    e.preventDefault();
    if (!selectedPlugin) return;
    
    // Validate required fields
    for (const field of selectedPlugin.requiresConfig || []) {
      if (field.required && !configValues[field.key]?.trim()) {
        alert(`Vui lòng điền trường bắt buộc: ${field.label}`);
        return;
      }
    }

    const alreadyInstalled = isInstalled(selectedPlugin.id);
    
    if (!alreadyInstalled) {
      // Install mới kèm cấu hình
      await executeAction('install', selectedPlugin.id, configValues);
    } else {
      // Cập nhật cấu hình hiện tại
      setSaving(true);
      try {
        const res = await fetch('/api/admin/plugins', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pluginId: selectedPlugin.id, config: configValues })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save config');
        
        showToast('✅ Đã lưu cấu hình plugin!');
        setModalOpen(false);
        await fetchPlugins();
      } catch (err) {
        alert('Lỗi: ' + err.message);
      } finally {
        setSaving(false);
      }
    }
  }

  // Phân tách danh sách
  const installedPlugins = plugins.filter(p => isInstalled(p.id));
  const availablePlugins = plugins.filter(p => !isInstalled(p.id)).filter(p => {
    if (category === 'all') return true;
    return p.category === category;
  });

  return (
    <AdminShell title="Hệ thống Plugin">
      <div className="adm-card" style={{ border: '1px solid var(--admin-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
        <div className="adm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '24px', borderBottom: '1px solid var(--admin-border)' }}>
          <div>
            <div className="adm-card-title" style={{ fontSize: '18px', fontWeight: '800', color: 'var(--admin-text)' }}>
              {showStore ? '🛍️ Thêm Plugin Mới (Marketplace Store)' : '🧩 Plugins Đã Cài Đặt'}
            </div>
            <div className="adm-card-subtitle" style={{ color: 'var(--admin-muted)', fontSize: '13px', marginTop: '6px' }}>
              {showStore 
                ? 'Tìm kiếm và cài đặt thêm các tính năng mở rộng từ kho ứng dụng hệ thống.' 
                : 'Các plugin đã kích hoạt và đang cấu hình hoạt động trên website của bạn.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              className={showStore ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
              onClick={() => {
                setShowStore(!showStore);
                setCategory('all');
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
            >
              {showStore ? '← Trở về Plugins' : '➕ Thêm Plugin Mới'}
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={fetchPlugins} 
              disabled={loading} 
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              🔄
            </button>
          </div>
        </div>

        {/* Category Filters (Chỉ hiện khi xem Store) */}
        {showStore && (
          <div style={{ display: 'flex', gap: '8px', padding: '16px 24px', borderBottom: '1px solid var(--admin-border)', flexWrap: 'wrap', background: '#f8fafc' }}>
            {[
              { id: 'all', label: '🔮 Tất cả' },
              { id: 'payment', label: '💳 Thanh toán' },
              { id: 'shipping', label: '🚚 Vận chuyển' },
              { id: 'seo', label: '🔍 SEO' },
              { id: 'analytics', label: '📊 Analytics' },
              { id: 'support', label: '💬 Hỗ trợ' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  background: category === cat.id ? 'var(--admin-primary)' : '#ffffff',
                  border: '1px solid ' + (category === cat.id ? 'var(--admin-primary)' : '#cbd5e1'),
                  color: category === cat.id ? '#ffffff' : '#334155',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: category === cat.id ? '0 4px 6px -1px rgba(13, 104, 50, 0.2)' : 'none'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        <div className="adm-card-body" style={{ padding: '24px' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px', fontSize: '13px', fontWeight: '500' }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid rgba(13, 104, 50, 0.1)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              {/* PHẦN 1: SHOW INSTALLED PLUGINS */}
              {!showStore && (
                installedPlugins.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', border: '1px dashed var(--admin-border)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧩</div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--admin-text)', margin: '0 0 8px' }}>Chưa cài đặt plugin nào</h3>
                    <p style={{ fontSize: '13px', color: 'var(--admin-muted)', margin: '0 0 20px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
                      Nhấn nút bên dưới để khám phá kho ứng dụng và nâng cấp thêm nhiều tính năng mới cho website của bạn.
                    </p>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setShowStore(true)} 
                      style={{ fontWeight: '600' }}
                    >
                      Cài đặt Plugin mới
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {installedPlugins.map(plugin => {
                      return (
                        <div
                          key={plugin.id}
                          className="plugin-card"
                          style={{
                            background: '#ffffff',
                            border: '1px solid #ef7d9c',
                            borderRadius: '12px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            position: 'relative',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ fontSize: '28px', background: '#f1f5f9', width: '54px', height: '54px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                              {plugin.icon || '🧩'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plugin.name}</h4>
                              <span style={{ fontSize: '12px', color: 'var(--admin-muted)', display: 'block', marginTop: '2px' }}>v{plugin.version} · {plugin.author}</span>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: '#ecfdf5', color: '#ef7d9c', fontWeight: '700', border: '1px solid #a7f3d0' }}>
                                  {plugin.free ? 'Miễn phí' : plugin.price || 'Có phí'}
                                </span>
                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: '#d1fae5', color: '#065f46', fontWeight: '700', border: '1px solid #a7f3d0' }}>
                                  ✓ Đã cài
                                </span>
                              </div>
                            </div>
                          </div>

                          <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6', flex: 1 }}>
                            {plugin.description}
                          </p>

                          <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '4px' }}>
                            {plugin.requiresConfig && plugin.requiresConfig.length > 0 && (
                              <button
                                onClick={() => handleConfigureClick(plugin)}
                                className="btn btn-secondary btn-sm"
                                style={{ flex: 1, fontWeight: '600' }}
                              >
                                ⚙️ Cấu hình
                              </button>
                            )}
                            <button
                              onClick={() => handleUninstall(plugin.id)}
                              className="btn btn-danger btn-sm"
                              style={{ flex: 1, fontWeight: '600' }}
                            >
                              🗑️ Gỡ cài đặt
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* PHẦN 2: SHOW STORE TO INSTALL NEW PLUGINS */}
              {showStore && (
                availablePlugins.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', border: '1px dashed var(--admin-border)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔮</div>
                    <p style={{ fontSize: '13px', margin: 0, color: 'var(--admin-muted)', fontWeight: '500' }}>Không có plugin mới nào khả dụng trong danh mục này.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {availablePlugins.map(plugin => {
                      return (
                        <div
                          key={plugin.id}
                          className="plugin-card-store"
                          style={{
                            background: '#ffffff',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '12px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            position: 'relative',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.borderColor = 'var(--admin-primary)';
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.04)';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.borderColor = 'var(--admin-border)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ fontSize: '28px', background: '#f1f5f9', width: '54px', height: '54px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                              {plugin.icon || '🧩'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plugin.name}</h4>
                              <span style={{ fontSize: '12px', color: 'var(--admin-muted)', display: 'block', marginTop: '2px' }}>v{plugin.version} · {plugin.author}</span>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: plugin.free ? '#fef2f6' : '#fffbeb', color: plugin.free ? '#ef7d9c' : '#d97706', fontWeight: '700', border: '1px solid ' + (plugin.free ? '#f8d7e0' : '#fde68a') }}>
                                  {plugin.free ? 'Miễn phí' : plugin.price || 'Có phí'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6', flex: 1 }}>
                            {plugin.description}
                          </p>

                          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '4px' }}>
                            <button
                              onClick={() => handleInstall(plugin)}
                              className="btn btn-primary"
                              style={{ width: '100%', fontWeight: '600' }}
                            >
                              ⬇️ Cài đặt Plugin
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Cấu hình Plugin */}
      {modalOpen && selectedPlugin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setModalOpen(false)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{selectedPlugin.icon || '🧩'}</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--admin-text)' }}>Cấu hình: {selectedPlugin.name}</h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={saveConfig} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(selectedPlugin.requiresConfig || []).map(field => (
                  <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <input
                      type={field.type === 'password' ? 'password' : 'text'}
                      value={configValues[field.key] || ''}
                      onChange={e => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                      placeholder={field.default || ''}
                      required={field.required}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        color: 'var(--admin-text)',
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        width: '100%'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--admin-primary)'}
                      onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                    />
                    {field.hint && <span style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>{field.hint}</span>}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)} disabled={saving} style={{ fontWeight: '600' }}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving} style={{ fontWeight: '600' }}>
                  {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          background: 'var(--admin-primary)', border: '1px solid var(--admin-primary)',
          color: '#ffffff', padding: '14px 24px', borderRadius: '10px',
          fontSize: '13px', fontWeight: '700', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {toastMsg}
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </AdminShell>
  );
}
