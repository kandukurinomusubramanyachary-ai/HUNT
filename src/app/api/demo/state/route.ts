import { NextResponse } from 'next/server';
import { z } from 'zod';
import { commerceDatabase, readCommerce, writeCommerce } from '@/lib/commerce-persistence.mjs';
import { commerceSnapshotSchema } from '@/lib/commerce-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = commerceDatabase();
  try { return NextResponse.json(readCommerce(db), { headers: { 'Cache-Control': 'no-store' } }); }
  finally { db.close(); }
}

export async function POST(request: Request) {
  const db = commerceDatabase();
  try { return NextResponse.json(writeCommerce(db, commerceSnapshotSchema.omit({ initialized: true }).parse(await request.json())), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? 'Invalid demo state' : error instanceof Error ? error.message : 'Persistence failed' }, { status: 400 });
  } finally { db.close(); }
}
