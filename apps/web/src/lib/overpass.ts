/**
 * Fetch real supermarket and convenience-store locations near a coordinate
 * from OpenStreetMap via the Overpass API. Recognises major AU chains:
 * Coles, Woolworths, ALDI, IGA (incl. Xpress), 7-Eleven, NightOwl,
 * FoodWorks, Friendly Grocer, Costco.
 */

export interface RealStore {
  id: number;
  retailerCode: string;
  /** True for shop=convenience or chain known to be convenience-only. */
  isConvenience: boolean;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  openingHours?: string;
  phone?: string;
  website?: string;
  /** Distance from query origin in km, if available. */
  distanceKm?: number;
}

/**
 * Public Overpass mirrors. We try them in order so a single mirror being
 * rate-limited / returning 406 ("Not Acceptable" / output-quota) doesn't
 * fail the whole request. Per Overpass etiquette: send a descriptive
 * User-Agent so operators can identify and contact us if needed.
 */
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const USER_AGENT =
  'SmartShopper/0.1 (+https://smartshopper.vercel.app; au-grocery-price-comparison)';

/**
 * Query Overpass for supermarkets + convenience stores near a point.
 * `shop=supermarket` / `convenience` / `greengrocer` / `wholesale` cover
 * both supermarkets and the niche chains; brand-name matching identifies
 * the AU retailers we care about.
 */
export async function fetchNearbyStores(
  lat: number,
  lng: number,
  radiusMeters = 10000,
): Promise<RealStore[]> {
  const query = `
    [out:json][timeout:15];
    (
      nwr["shop"="supermarket"](around:${radiusMeters},${lat},${lng});
      nwr["shop"="convenience"](around:${radiusMeters},${lat},${lng});
      nwr["shop"="greengrocer"](around:${radiusMeters},${lat},${lng});
      nwr["shop"="wholesale"](around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `;

  const body = `data=${encodeURIComponent(query)}`;

  let lastErr: string | null = null;
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const res = await fetch(mirror, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
        },
        body,
      });

      if (!res.ok) {
        lastErr = `${mirror} → ${res.status}`;
        console.warn(`Overpass mirror failed: ${lastErr}`);
        continue;
      }

      const data = await res.json();
      return parseElements(data, { lat, lng });
    } catch (err) {
      lastErr = `${mirror} → ${(err as Error)?.message ?? 'fetch error'}`;
      console.warn(`Overpass mirror threw: ${lastErr}`);
      continue;
    }
  }

  console.warn(`All Overpass mirrors failed: ${lastErr}`);
  return [];
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function parseElements(
  data: { elements?: OverpassElement[] },
  origin: { lat: number; lng: number },
): RealStore[] {
  const stores: RealStore[] = [];
  for (const el of data.elements ?? []) {
    const tags = el.tags ?? {};
    const shopTag = (tags.shop ?? '').toLowerCase();
    const name = tags.name ?? '';
    const brand = tags.brand ?? '';
    const operator = tags.operator ?? '';
    const combined = `${name} ${brand} ${operator}`.toLowerCase();

    const match = identifyRetailer(combined, shopTag);
    if (!match) continue;

    const storeLat = el.lat ?? el.center?.lat;
    const storeLng = el.lon ?? el.center?.lon;
    if (storeLat == null || storeLng == null) continue;

    stores.push({
      id: el.id,
      retailerCode: match.retailerCode,
      isConvenience: match.isConvenience,
      name: name || brand || prettifyRetailerCode(match.retailerCode),
      lat: storeLat,
      lng: storeLng,
      address: buildAddress(tags),
      openingHours: tags.opening_hours,
      phone: tags.phone ?? tags['contact:phone'],
      website: tags.website ?? tags['contact:website'],
      distanceKm: haversineKm(origin, { lat: storeLat, lng: storeLng }),
    });
  }
  stores.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  return stores;
}

interface RetailerMatch {
  retailerCode: string;
  isConvenience: boolean;
}

/**
 * Map a combined name/brand/operator string + OSM shop tag to one of our
 * known retailer codes. Order matters: more specific patterns first so e.g.
 * "IGA Xpress" is tagged as a convenience variant of iga rather than
 * misclassified.
 */
function identifyRetailer(text: string, shopTag: string): RetailerMatch | null {
  if (!text) return null;

  // ── Convenience-format variants of supermarket brands ──
  // Checked first so they aren't misclassified as the full supermarket.
  if (/\biga\s*(xpress|express)\b/.test(text)) return { retailerCode: 'iga', isConvenience: true };
  if (/\b7[\s\-]?eleven\b/.test(text)) return { retailerCode: 'seven_eleven', isConvenience: true };
  if (/\bnight\s*owl\b/.test(text)) return { retailerCode: 'nightowl', isConvenience: true };

  // ── Indie supermarket chains ──
  if (/\bfoodworks\b/.test(text)) return { retailerCode: 'foodworks', isConvenience: shopTag === 'convenience' };
  if (/\bfriendly\s*grocer\b/.test(text)) return { retailerCode: 'friendly_grocer', isConvenience: shopTag === 'convenience' };
  if (/\bdrakes\b/.test(text)) return { retailerCode: 'drakes', isConvenience: false };
  if (/\bharris\s*farm\b/.test(text)) return { retailerCode: 'harris_farm', isConvenience: false };
  if (/\bcostco\b/.test(text)) return { retailerCode: 'costco', isConvenience: false };
  if (/\bfoodland\b/.test(text)) return { retailerCode: 'foodland', isConvenience: false };
  if (/\bspudshed\b/.test(text)) return { retailerCode: 'spudshed', isConvenience: false };
  if (/\bsupabarn\b/.test(text)) return { retailerCode: 'supabarn', isConvenience: false };
  if (/\britchies\b/.test(text)) return { retailerCode: 'ritchies', isConvenience: false };
  if (/\bromeo'?s\b/.test(text)) return { retailerCode: 'romeos', isConvenience: false };

  // ── Servo / petrol-station convenience ──
  // These are often tagged amenity=fuel + shop=convenience together in OSM.
  // We match by brand name regardless of shop tag.
  if (/\botr\b|\bon[\s\-]?the[\s\-]?run\b/.test(text)) return { retailerCode: 'otr', isConvenience: true };
  if (/\blucky\s*7\b/.test(text)) return { retailerCode: 'lucky_7', isConvenience: true };
  if (/\bampol\b|\bcaltex\b/.test(text)) return { retailerCode: 'ampol', isConvenience: true };
  if (/\bbp\b/.test(text)) return { retailerCode: 'bp', isConvenience: true };
  if (/\bshell\b/.test(text)) return { retailerCode: 'shell', isConvenience: true };
  if (/\bmobil\b/.test(text)) return { retailerCode: 'mobil', isConvenience: true };
  if (/\bunited\s*petroleum\b/.test(text)) return { retailerCode: 'united', isConvenience: true };

  // ── Big four ──
  if (/\bcoles\s*(express|local)\b/.test(text)) {
    return { retailerCode: 'coles', isConvenience: true };
  }
  if (/\bcoles\b/.test(text) && !/\b(kmart|express|local)\b/.test(text)) {
    return { retailerCode: 'coles', isConvenience: false };
  }
  if (/\b(woolworths|woolies|woolworths\s*metro)\b/.test(text)) {
    const isMetro = /metro/.test(text);
    return { retailerCode: 'woolworths', isConvenience: isMetro };
  }
  if (/\baldi\b/.test(text)) return { retailerCode: 'aldi', isConvenience: false };
  if (/\biga\b/.test(text)) return { retailerCode: 'iga', isConvenience: false };

  return null;
}

function prettifyRetailerCode(code: string): string {
  return code
    .split('_')
    .map((p) => (p === 'seven' ? '7' : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
    .replace('7 Eleven', '7-Eleven');
}

function buildAddress(tags: Record<string, string> | undefined): string | undefined {
  if (!tags) return undefined;
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'] ?? tags['addr:city'],
    tags['addr:postcode'],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : undefined;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
