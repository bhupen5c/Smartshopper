/**
 * Great-circle (haversine) distance between two WGS-84 coordinates, in kilometres.
 * Accurate enough for supermarket-trip distance decisions (< 0.5% error at < 100 km).
 */
export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371.0088;
const DEG_TO_RAD = Math.PI / 180;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = (b.lat - a.lat) * DEG_TO_RAD;
  const dLng = (b.lng - a.lng) * DEG_TO_RAD;
  const lat1 = a.lat * DEG_TO_RAD;
  const lat2 = b.lat * DEG_TO_RAD;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Estimate driving minutes for a given point-to-point road distance.
 * We don't have a routing engine in core, so we apply a sensible urban-AU fudge:
 * road distance ≈ haversine × 1.35, average speed 35 km/h.
 */
export function estimateDrivingMinutes(haversineKmDistance: number): number {
  const roadKm = haversineKmDistance * 1.35;
  return (roadKm / 35) * 60;
}

/** Convert a list of candidate stores to those within maxKm of origin, sorted by distance. */
export function nearestStores<T extends { location: LatLng }>(
  origin: LatLng,
  stores: readonly T[],
  maxKm: number,
): Array<T & { distanceKm: number }> {
  return stores
    .map((s) => ({ ...s, distanceKm: haversineKm(origin, s.location) }))
    .filter((s) => s.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
