/**
 * GET/POST /api/cron/scrape-prices
 *
 * Daily cron entry point — triggered by Vercel Cron at midnight AEST
 * (14:00 UTC). Runs every active scrape strategy in sequence so the
 * supermarket prices populate the cache that derived convenience
 * strategies read from.
 *
 * Auth: requires `Authorization: Bearer ${CRON_SECRET}` so external
 * callers can't trigger scrapes ad-hoc. Vercel Cron sets this header
 * automatically when the CRON_SECRET env var is configured.
 *
 * On Vercel Hobby (10 s function limit) this is too tight for a full
 * run, so this route is a fan-out trampoline:
 *   - With QSTASH_TOKEN set: enqueue one message per retailer via Upstash
 *     QStash and return immediately. Each retailer scrape runs in its
 *     own invocation.
 *   - Without QSTASH_TOKEN: run serially in-process. Useful for dev /
 *     Vercel Pro plans with longer maxDuration.
 */

import { NextResponse } from 'next/server';
import { listActiveRetailers, runAll } from '@smartshopper/scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  // CRON_SECRET is mandatory. Without it the route would be an open,
  // unauthenticated trigger for a job that spends money (Gemini calls) —
  // so refuse to run rather than run wide open.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured — refusing to run an unauthenticated scrape' },
      { status: 503 },
    );
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'CRON_SECRET mismatch' }, { status: 401 });
  }

  try {
    const qstashToken = process.env.QSTASH_TOKEN;
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    // Fan-out path: enqueue one QStash message per retailer.
    if (qstashToken && baseUrl) {
      const retailers = await listActiveRetailers({});
      if (retailers.length === 0) {
        return NextResponse.json(
          { mode: 'qstash_fanout', retailers: 0, note: 'No active retailers — Supabase config empty or unreachable' },
          { status: 200 },
        );
      }
      const results = await Promise.allSettled(
        retailers.map((retailerCode) =>
          fetch(`https://qstash.upstash.io/v2/publish/${baseUrl}/api/cron/scrape-retailer`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${qstashToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ retailerCode, cronSecret }),
          }),
        ),
      );
      const queued = results.filter((r) => r.status === 'fulfilled').length;
      return NextResponse.json({
        mode: 'qstash_fanout',
        retailers: retailers.length,
        queued,
        failed: retailers.length - queued,
      });
    }

    // Serial path: run everything in this request. Fine on Pro w/
    // maxDuration=300, tight on Hobby.
    const results = await runAll({});
    return NextResponse.json({
      mode: 'serial',
      retailers: results.length,
      items: results.reduce((sum, r) => sum + r.itemsEmitted, 0),
      failures: results.filter((r) => !r.ok).map((r) => r.retailerCode),
    });
  } catch (err) {
    // Most likely "Supabase not configured" — return a clean error, not a
    // raw 500, so the cron dashboard shows a readable reason.
    console.error('scrape-prices cron error:', err);
    return NextResponse.json(
      { error: 'Scrape run failed', detail: (err as Error).message },
      { status: 500 },
    );
  }
}

// Allow POST too — Vercel Cron sometimes sends POST.
export const POST = GET;
