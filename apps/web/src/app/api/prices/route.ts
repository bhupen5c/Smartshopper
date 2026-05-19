/**
 * GET /api/prices
 *
 * Returns the latest price per (retailer, product) pair from the
 * `latest_prices` view in Supabase. Consumed by the shopping context so
 * `buildOffers()` can use live scraped prices instead of the in-repo
 * PRICE_MATRIX. The response is small enough (~150 rows) that one fetch
 * per page load is fine; we cache aggressively on the CDN.
 *
 * Falls back gracefully — if Supabase isn't configured or unreachable,
 * returns an empty array and the client falls through to PRICE_MATRIX.
 */

import { NextResponse } from 'next/server';
import { readClient } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export interface LivePrice {
  retailerCode: string;
  productId: string;
  price: number;
  wasPrice: number | null;
  isTrueSpecial: boolean;
  memberOnly: boolean;
  retailerSku: string | null;
  scrapedAt: string;
}

export async function GET() {
  const supabase = readClient();
  if (!supabase) {
    // Supabase not configured — return empty array; client falls back to
    // the in-repo PRICE_MATRIX. `seen` reports which env vars are visible
    // (booleans only, no secret values) so misconfig is easy to diagnose.
    return NextResponse.json(
      {
        prices: [],
        note: 'Supabase not configured',
        seen: {
          SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
          NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
          NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        },
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const { data, error } = await supabase
      .from('latest_prices')
      .select('retailer_code, product_id, price, was_price, is_true_special, member_only, retailer_sku, scraped_at');

    if (error) throw error;

    const prices: LivePrice[] = (data ?? [])
      .filter(
        (r): r is typeof r & { retailer_code: string; product_id: string; price: number } =>
          r.retailer_code !== null && r.product_id !== null && r.price !== null,
      )
      .map((r) => ({
        retailerCode: r.retailer_code,
        productId: r.product_id,
        price: Number(r.price),
        wasPrice: r.was_price === null ? null : Number(r.was_price),
        isTrueSpecial: Boolean(r.is_true_special),
        memberOnly: Boolean(r.member_only),
        retailerSku: r.retailer_sku,
        scrapedAt: r.scraped_at ?? '',
      }));

    // 5 min CDN cache so the optimiser doesn't hammer Supabase on every
    // results-page render. Nightly scrapes overwrite this naturally.
    return NextResponse.json(
      { prices },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        },
      },
    );
  } catch (err) {
    console.error('prices api error:', err);
    return NextResponse.json(
      { prices: [], error: 'Supabase read failed' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
