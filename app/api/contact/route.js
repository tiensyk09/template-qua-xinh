import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/contact — công khai: khách gửi tin nhắn liên hệ
export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || '').trim();
    const phone = (body.phone || '').trim();
    const email = (body.email || '').trim();
    const subject = (body.subject || '').trim();
    const message = (body.message || '').trim();

    // Chống gửi trống: bắt buộc tên + (điện thoại hoặc email) + nội dung
    if (!name) {
      return NextResponse.json({ error: 'Vui lòng nhập họ và tên.' }, { status: 400 });
    }
    if (!phone && !email) {
      return NextResponse.json({ error: 'Vui lòng nhập số điện thoại hoặc email để chúng tôi liên hệ lại.' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Vui lòng nhập nội dung tin nhắn.' }, { status: 400 });
    }
    if (email && !email.includes('@')) {
      return NextResponse.json({ error: 'Địa chỉ email không hợp lệ.' }, { status: 400 });
    }

    await query(
      'INSERT INTO contact_messages (name, phone, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, phone || null, email || null, subject || null, message, 'new']
    );

    return NextResponse.json({ success: true, message: 'Đã gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/contact — chỉ mod/admin: danh sách tin nhắn
export async function GET(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let rows;
    if (status && status !== 'all') {
      rows = await query('SELECT * FROM contact_messages WHERE status = ? ORDER BY id DESC', [status]);
    } else {
      rows = await query('SELECT * FROM contact_messages ORDER BY id DESC');
    }

    const unreadRows = await query("SELECT COUNT(*) as cnt FROM contact_messages WHERE status = 'new'");
    const unread = unreadRows[0]?.cnt || 0;

    return NextResponse.json({ messages: rows, unread, total: rows.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
