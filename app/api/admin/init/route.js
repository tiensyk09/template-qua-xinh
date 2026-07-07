import { NextResponse } from 'next/server';
import { initDatabase, seedData } from '@/lib/initDb';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    // If table users exists and has at least one admin, verify credentials
    let hasAdmin = false;
    try {
      const users = await query("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'");
      if (users && users[0] && users[0].cnt > 0) {
        hasAdmin = true;
      }
    } catch {
      // Table doesn't exist or is empty
    }

    if (hasAdmin) {
      const user = await getAuthUser();
      const authErr = requireAuth(user, 'admin');
      if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });
    }

    const { searchParams } = new URL(request.url);
    const adminPassword = searchParams.get('adminPassword') || undefined;
    const force = searchParams.get('force') === 'true';

    await initDatabase();
    await seedData(adminPassword, force);
    return NextResponse.json({ success: true, message: 'Database initialized and seeded' });
  } catch (err) {
    console.error('Init error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
