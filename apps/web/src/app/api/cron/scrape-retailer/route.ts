/**
 * POST /api/cron/scrape-retailer
 *
 * QStash callback: receives a single retailer code, scrapes it, writes to
 * Supabase. One QStash message per retailer = one invocation, so each
 * request fits comfortably within Vercel Hobby's 10 s function limit
 * (assuming the strategy itself is fast or paginated).
 *
 * Body: { retailerCode: string, cronSecret: string }
 */

import { NextResponse } from 'next/server';
import { runRetailer } from '@smartshopper/scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface Body {
  retailerCode?: unknown;
  cronSecret?: unknown;
}

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // CRON_SECRET is mandatory — this worker writes to the DB + spends
  // Gemini credits, so it must never be callable unauthenticated.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 503 },
    );
  }
  if (body.cronSecret !== cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET mismatch' }, { status: 401 });
  }

  if (typeof body.retailerCode !== 'string') {
    return NextResponse.json({ error: 'retailerCode required' }, { status: 400 });
  }

  try {
    // runRetailer throws if the retailer isn't found or has no runnable
    // strategy — caught below and returned as a 500 with the reason.
    const result = await runRetailer(body.retailerCode, {});
    return NextResponse.json({
      retailerCode: result.retailerCode,
      ok: result.ok,
      items: result.itemsEmitted,
      errors: result.errorsCount,
      notes: result.notes,
    });
  } catch (err) {
    console.error('scrape-retailer error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
