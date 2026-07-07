'use client';
import { useEffect, useState, useRef } from 'react';

/* ─────────────────────────────────────────────
   GEMINI AI CHAT WIDGET
   Chat trực tiếp qua /api/plugins/gemini-assistant/chat
   — API key được giữ an toàn phía server (D1)
───────────────────────────────────────────── */
function GeminiChatWidget() {
  const AI_PRIMARY = '#ef7d9c';
  const AI_PRIMARY_2 = '#d1567a';
  const AI_QUICK = ['Quà bán chạy', 'Gợi ý quà sinh nhật', 'Gói quà & thiệp', 'Tư vấn theo ngân sách'];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Xin chào 🎁 Mình là trợ lý tư vấn của Quà Xinh. Bạn cần chọn quà cho dịp nào, tặng ai và ngân sách bao nhiêu để mình gợi ý phụ kiện & quà tặng xinh xắn phù hợp nhé!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  async function send(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/plugins/gemini-assistant/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.slice(-12) })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || data.error || 'Xin lỗi, tôi không thể trả lời lúc này.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Lỗi kết nối. Vui lòng thử lại.' }]);
    } finally { setLoading(false); }
  }
  function sendMessage(e) { e.preventDefault(); send(input); }

  return (
    <>
      {open && (
        <div style={{
          position: 'fixed', bottom: '88px', right: '20px',
          width: '360px', maxWidth: 'calc(100vw - 40px)', maxHeight: '520px',
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
          display: 'flex', flexDirection: 'column',
          zIndex: 9998, overflow: 'hidden',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${AI_PRIMARY}, ${AI_PRIMARY_2})`,
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>Trợ lý tư vấn sản phẩm</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />Đang trực tuyến
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', background: '#f7f7f8' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: m.role === 'user' ? AI_PRIMARY : '#fff', color: m.role === 'user' ? '#fff' : '#1a1a1a', fontSize: '13px', lineHeight: '1.5', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '4px', padding: '8px 12px' }}>
                {[0,1,2].map(i => (<div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: AI_PRIMARY, animation: `pluginBounce 1s ease-in-out ${i * 0.2}s infinite` }}/>))}
              </div>
            )}
            {messages.filter(m => m.role === 'user').length === 0 && !loading && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {AI_QUICK.map((q, i) => (
                  <button key={i} onClick={() => send(q)} style={{ background: '#fff', border: `1px solid ${AI_PRIMARY}33`, color: AI_PRIMARY, fontSize: '11.5px', fontWeight: 600, padding: '6px 11px', borderRadius: '999px', cursor: 'pointer' }}>{q}</button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} style={{ padding: '10px 12px', borderTop: '1px solid #eee', display: 'flex', gap: '8px', background: '#fff' }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Nhập nhu cầu của bạn..." style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e2e2', borderRadius: '20px', fontSize: '13px', outline: 'none', background: '#f7f7f8' }} />
            <button type="submit" disabled={loading || !input.trim()} style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() ? AI_PRIMARY : '#d1d5db', border: 'none', cursor: input.trim() ? 'pointer' : 'default', color: '#fff', fontSize: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>➤</button>
          </form>
        </div>
      )}

      {/* Nút nổi góc PHẢI DƯỚI */}
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'fixed', bottom: '20px', right: '20px', height: 56, borderRadius: '999px',
        background: `linear-gradient(135deg, ${AI_PRIMARY}, ${AI_PRIMARY_2})`,
        border: 'none', cursor: 'pointer', padding: open ? '0' : '0 20px 0 8px', width: open ? 56 : 'auto',
        boxShadow: '0 6px 22px rgba(0,0,0,0.32)', display: 'flex', alignItems: 'center', gap: 10, zIndex: 9999, transition: 'all 0.2s'
      }} title="Chat với AI tư vấn sản phẩm">
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{open ? '✕' : '🤖'}</span>
        {!open && <span style={{ color: '#fff', fontWeight: 700, fontSize: '13.5px', whiteSpace: 'nowrap' }}>Tư vấn sản phẩm</span>}
      </button>

      <style>{`
        @keyframes pluginBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </>
  );
}

/* ─────────────────────────────────────────────
   GOOGLE ANALYTICS 4 WIDGET
───────────────────────────────────────────── */
function GoogleAnalyticsWidget({ measurementId }) {
  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return;
    if (document.getElementById('ga4-plugin-script')) return;
    const s1 = document.createElement('script');
    s1.id = 'ga4-plugin-script';
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(s1);
    const s2 = document.createElement('script');
    s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}');`;
    document.head.appendChild(s2);
  }, [measurementId]);
  return null;
}

/* ─────────────────────────────────────────────
   MAIN PLUGIN RUNNER
   Đọc plugin đã cài từ D1 của website (/api/plugins)
   Render widget tương ứng cho từng plugin active
───────────────────────────────────────────── */
export default function PluginRunner() {
  const [plugins, setPlugins] = useState([]);
  const [gaMeasurementId, setGaMeasurementId] = useState('');

  useEffect(() => {
    fetch('/api/plugins')
      .then(r => r.json())
      .then(async data => {
        setPlugins(data.installed || []);

        // Google Analytics cần measurementId — fetch từ admin API (có auth cookie)
        const gaPlugin = (data.installed || []).find(p => p.id === 'analytics-google');
        if (gaPlugin?.hasConfig) {
          try {
            const r2 = await fetch('/api/admin/plugins');
            if (r2.ok) {
              const d2 = await r2.json();
              const gaInstalled = (d2.installed || []).find(p => p.id === 'analytics-google');
              if (gaInstalled?.config?.MEASUREMENT_ID) {
                setGaMeasurementId(gaInstalled.config.MEASUREMENT_ID);
              }
            }
          } catch { /* not logged in — skip GA */ }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {plugins.map(plugin => {
        switch (plugin.id) {
          case 'gemini-assistant':
            return <GeminiChatWidget key={plugin.id} />;
          case 'analytics-google':
            return <GoogleAnalyticsWidget key={plugin.id} measurementId={gaMeasurementId} />;
          default:
            return null;
        }
      })}
    </>
  );
}
