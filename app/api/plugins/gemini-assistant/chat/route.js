import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/plugins/gemini-assistant/chat
// Trợ lý AI tư vấn sản phẩm — dùng Cloudflare Workers AI (MIỄN PHÍ).
// Key (CF_ACCOUNT_ID + CF_API_TOKEN) do website-manager lưu & bơm vào config lúc cài plugin,
// đọc từ DB của chính website — không lộ ra frontend.
const CF_MODEL = '@cf/meta/llama-3.1-8b-instruct';

export async function POST(request) {
  try {
    const body = await request.json();
    const history = Array.isArray(body.messages) ? body.messages : null;
    const singleMessage = body.message;
    if (!history && !singleMessage) {
      return NextResponse.json({ error: 'Thiếu tham số message' }, { status: 400 });
    }

    // Đọc config plugin từ DB của website (do manager bơm key Cloudflare vào)
    const rows = await query(
      "SELECT config FROM installed_plugins WHERE id = 'gemini-assistant' AND active = 1"
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Plugin trợ lý AI chưa được cài đặt trên website này.' }, { status: 404 });
    }
    const config = typeof rows[0].config === 'string' ? JSON.parse(rows[0].config) : (rows[0].config || {});
    const accountId = config.CF_ACCOUNT_ID || config.cf_account_id;
    const apiToken = config.CF_API_TOKEN || config.cf_api_token;
    if (!accountId || !apiToken) {
      return NextResponse.json({ error: 'Chưa có key Cloudflare AI. Cài plugin qua website-manager để tự động nạp key.' }, { status: 400 });
    }

    // ── Ngữ cảnh cửa hàng: tên shop + danh mục + sản phẩm (giá, mô tả) ──
    let storeName = 'cửa hàng';
    let catalog = '';
    let categoryList = '';
    try {
      const st = await query("SELECT `value` FROM settings WHERE `key` = 'site_title' LIMIT 1");
      if (st?.[0]?.value) storeName = st[0].value;
    } catch { /* bỏ qua */ }
    try {
      const cats = await query("SELECT name FROM shop_categories WHERE is_active = 1 ORDER BY sort_order LIMIT 20");
      categoryList = (cats || []).map(c => c.name).join(', ');
    } catch { /* bỏ qua */ }
    try {
      const prods = await query(
        "SELECT name, price, original_price, short_description FROM products WHERE status = 'active' ORDER BY is_featured DESC, sold_count DESC LIMIT 40"
      );
      catalog = (prods || []).map(p => {
        const price = p.price ? Number(p.price).toLocaleString('vi-VN') + 'đ' : 'liên hệ';
        const old = p.original_price && p.original_price > p.price ? ` (giá gốc ${Number(p.original_price).toLocaleString('vi-VN')}đ)` : '';
        const desc = p.short_description ? ` — ${p.short_description}` : '';
        return `• ${p.name}: ${price}${old}${desc}`;
      }).join('\n');
    } catch { /* bỏ qua */ }

    const systemPrompt =
`Bạn là trợ lý tư vấn của "${storeName}" — shop phụ kiện & quà tặng xinh xắn. Nhiệm vụ: tư vấn chọn phụ kiện & quà tặng phù hợp cho từng dịp, gợi ý gói quà và giải đáp thắc mắc mua hàng.
NGUYÊN TẮC:
- Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, dễ thương, đi thẳng vào nhu cầu của khách.
- Chỉ giới thiệu sản phẩm CÓ trong danh sách dưới đây, luôn kèm giá. Không bịa sản phẩm/giá.
- Khi khách nêu dịp tặng (sinh nhật, kỷ niệm, valentine...), người nhận hoặc ngân sách, gợi ý 1-3 món phù hợp nhất và giải thích ngắn vì sao; có thể đề xuất gói quà kèm theo.
- Nếu câu hỏi ngoài phạm vi cửa hàng, lịch sự hướng khách về sản phẩm hoặc mời để lại thông tin liên hệ.
- Có thể nhắc chính sách: gói quà miễn phí, kèm thiệp chúc, đổi trả 7 ngày, giao hàng toàn quốc.
${categoryList ? `\nDANH MỤC: ${categoryList}` : ''}
${catalog ? `\nDANH SÁCH SẢN PHẨM:\n${catalog}` : '\n(Chưa có dữ liệu sản phẩm — mời khách để lại nhu cầu để được tư vấn.)'}`;

    // ── Dựng messages theo chuẩn chat (role: system | user | assistant) ──
    const chatMessages = [{ role: 'system', content: systemPrompt }];
    if (history) {
      for (const m of history) {
        if (!m || !m.text) continue;
        chatMessages.push({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.text) });
      }
    } else {
      chatMessages.push({ role: 'user', content: String(singleMessage) });
    }

    // ── Gọi Cloudflare Workers AI (free) ──
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CF_MODEL}`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages, max_tokens: 800, temperature: 0.6 }),
      }
    );
    const data = await cfRes.json();
    if (!cfRes.ok || data.success === false) {
      const msg = data?.errors?.[0]?.message || 'Lỗi gọi Cloudflare Workers AI';
      return NextResponse.json({ error: msg }, { status: cfRes.status || 500 });
    }
    const reply = data.result?.response || 'Xin lỗi, tôi chưa có câu trả lời phù hợp. Bạn mô tả rõ hơn nhu cầu nhé?';
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
