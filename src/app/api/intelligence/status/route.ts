import { NextResponse } from 'next/server';
import { database, status } from '@/lib/intelligence/engine.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  let db: ReturnType<typeof database> | undefined;
  try { db = database(); return NextResponse.json(status(db), { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'Intelligence status is unavailable.' }, { status: 503 }); }
  finally { db?.close(); }
}
