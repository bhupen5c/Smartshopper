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
import { listRetailers, runAll } from '@smartshopper/scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function unauthorized(reason: string) {
  return NextResponse.json({ error: reason }, { status: 401 });
}

export async function GET(request: Request) {
  // Verify CRON_SECRET — Vercel Cron sends it automatically.
  const auth = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return unauthorized('CRON_SECRET mismatch');
  }

  const qstashToken = process.env.QSTASH_TOKEN;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  // Fan-out path: enqueue one QStash message per retailer.
  if (qstashToken && baseUrl) {
    const retailers = listRetailers();
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
}

// Allow POST too — Vercel Cron sometimes sends POST.
export const POST = GET;
