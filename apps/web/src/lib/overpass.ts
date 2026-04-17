/**
 * Fetch real supermarket locations near a coordinate from OpenStreetMap
 * via the Overpass API. Returns Coles, Woolworths, ALDI, and IGA stores
 * within a given radius.
 */

export interface RealStore {
  id: number;
  retailerCode: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  openingHours?: string;
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Query Overpass for supermarkets near a point.
 * Uses the `brand:wikidata` and `name` tags to identify AU chains.
 */
export async function fetchNearbyStores(
  lat: number,
  lng: number,
  radiusMeters = 10000,
): Promise<RealStore[]> {
  // Overpass QL: find nodes and ways tagged as supermarkets near the point
  const query = `
    [out:json][timeout:10];
    (
      nwr["shop"="supermarket"](around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    console.warn('Overpass API error:', res.status);
    return [];
  }

  const data = await res.json();
  const stores: RealStore[] = [];

  for (const el of data.elements ?? []) {
    const name = el.tags?.name ?? '';
    const brand = el.tags?.brand ?? '';
    const combined = `${name} ${brand}`.toLowerCase();

    const retailerCode = identifyRetailer(combined);
    if (!retailerCode) continue;

    // Get coordinates (nodes have lat/lng directly, ways/relations have center)
    const storeLat = el.lat ?? el.center?.lat;
    const storeLng = el.lon ?? el.center?.lon;
    if (!storeLat || !storeLng) continue;

    const address = buildAddress(el.tags);

    stores.push({
      id: el.id,
      retailerCode,
      name: name || `${brand}`,
      lat: storeLat,
      lng: storeLng,
      address,
      openingHours: el.tags?.opening_hours,
    });
  }

  return stores;
}

function identifyRetailer(text: string): string | null {
  if (text.includes('coles') && !text.includes('kmart')) return 'coles';
  if (text.includes('woolworths') || text.includes('woolies')) return 'woolworths';
  if (text.includes('aldi')) return 'aldi';
  if (text.includes('iga')) return 'iga';
  return null;
}

function buildAddress(tags: Record<string, string> | undefined): string | undefined {
  if (!tags) return undefined;
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'] ?? tags['addr:city'],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : undefined;
}
