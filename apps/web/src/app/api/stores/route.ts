/**
 * GET /api/stores?lat=...&lng=...&radius=10000
 *
 * Proxies the Overpass API to find real supermarkets + convenience stores
 * near a coordinate. Successful responses are cached on the CDN for 24 h;
 * upstream failures are returned with a short cache TTL so a transient
 * Overpass error (rate limit, 406 quota) doesn't poison the cache for a
 * full day.
 */

import { NextResponse } from 'next/server';
import { fetchNearbyStores } from '@/lib/overpass';

export const runtime = 'nodejs';
// Allow the route up to 25 s — Overpass timeout is 15 s and we try several
// mirrors. Default Vercel hobby/pro limit is 10/60 s; staying conservative.
export const maxDuration = 25;
// Don't apply Next.js route-level caching; we set Cache-Control per response.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latParam = url.searchParams.get('lat');
  const lngParam = url.searchParams.get('lng');
  const radiusParam = url.searchParams.get('radius');

  const lat = Number(latParam);
  const lng = Number(lngParam);
  const radius = Math.min(Math.max(Number(radiusParam) || 10000, 500), 25000);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: 'Invalid lat/lng' }, { status: 400 });
  }

  // Round to ~100m so caching is effective across nearby callers
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;

  try {
    const stores = await fetchNearbyStores(roundedLat, roundedLng, radius);

    if (stores.length === 0) {
      // Upstream returned nothing — could be a real "no shops nearby" answer,
      // or every mirror failed. Cache briefly so retries can fix it quickly.
      return NextResponse.json(
        { stores: [], note: 'No stores returned' },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        },
      );
    }

    return NextResponse.json(
      { stores },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      },
    );
  } catch (err) {
    console.error('stores api error:', err);
    return NextResponse.json(
      { stores: [], error: 'Upstream Overpass error' },
      {
        status: 200,
        headers: {
          // Don't cache errors — a 24 h-cached error would block recovery.
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}
