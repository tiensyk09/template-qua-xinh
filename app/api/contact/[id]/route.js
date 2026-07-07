import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PATCH /api/contact/[id] — cập nhật trạng thái (new | read | archived)
export async function PATCH(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status;
    const allowed = ['new', 'read', 'archived'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ.' }, { status: 400 });
    }
    await query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/contact/[id]
export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    await query('DELETE FROM contact_messages WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
