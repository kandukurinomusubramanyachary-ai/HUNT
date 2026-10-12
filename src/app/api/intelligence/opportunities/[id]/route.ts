import { NextResponse } from 'next/server';
import { database, opportunity } from '@/lib/intelligence/engine.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  let db: ReturnType<typeof database> | undefined;
  try { db = database(); const product = opportunity(db, params.id); return NextResponse.json(product || { error: 'Opportunity not found' }, { status: product ? 200 : 404, headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'Intelligence database is unavailable.' }, { status: 503 }); }
  finally { db?.close(); }
}
