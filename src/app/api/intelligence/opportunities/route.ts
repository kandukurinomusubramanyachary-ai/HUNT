import { NextResponse } from 'next/server';
import { database, opportunities } from '@/lib/intelligence/engine.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  let db: ReturnType<typeof database> | undefined;
  try { db = database(); return NextResponse.json({ opportunities: opportunities(db, process.env.HUNT_INCLUDE_FIXTURES === 'true'), generated_at: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'Intelligence database is unavailable. Check worker and storage permissions.' }, { status: 503 }); }
  finally { db?.close(); }
}
