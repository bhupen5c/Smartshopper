/**
 * GET /api/stores?lat=...&lng=...&radius=10000
 *
 * Proxies the Overpass API to find real supermarkets + convenience stores
 * near a coordinate. Cached on the edge for 24h so repeated requests for
 * the same metro area don't hammer the public Overpass instance.
 */

import { NextResponse } from 'next/server';
import { fetchNearbyStores } from '@/lib/overpass';

export const runtime = 'nodejs';
// Revalidate the route response every 24h; coordinates round to ~100m so
// neighbouring postcodes share cache entries.
export const revalidate = 86400;

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
    return NextResponse.json({ stores: [], error: 'Upstream Overpass error' }, { status: 200 });
  }
}
