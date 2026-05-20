import { ROAD_DISTANCE_FACTOR, drivingMinutesForRoadKm, haversineKm } from '../geo.js';
import type { LatLng } from '../geo.js';

export interface RouteStop {
  /** Index of this stop in the `stops` array passed to `planRoute`. */
  index: number;
  location: LatLng;
  /** Road distance driven to reach this stop from the previous point
   *  (the user's home for the first stop), km. */
  fromPreviousKm: number;
}

export interface PlannedRoute {
  /** Stops in the order they should be visited. */
  order: RouteStop[];
  /** Total loop distance — home → every stop → home, road km. */
  totalKm: number;
  /** Estimated driving time for the whole loop, minutes. */
  drivingMinutes: number;
}

/** Brute force is exact and instant up to here (8! = 40 320 permutations). */
const BRUTE_FORCE_LIMIT = 8;

/**
 * Plan the shortest closed shopping loop: home → every stop → home.
 *
 * This is the travelling-salesman problem. A grocery run visits only a
 * handful of stores, so we solve it exactly by brute force for ≤ 8 stops
 * and fall back to nearest-neighbour + 2-opt for the rare larger basket.
 *
 * The loop is billed *once* — a multi-store trip is a single drive, not N
 * independent round trips from home. That distinction is the whole point
 * of treating a split basket as a route: visiting two stores 1 km apart
 * costs barely more than visiting one.
 */
export function planRoute(origin: LatLng, stops: readonly LatLng[]): PlannedRoute {
  if (stops.length === 0) return { order: [], totalKm: 0, drivingMinutes: 0 };

  // Distance matrix over [home, ...stops]; index 0 is home.
  const points = [origin, ...stops];
  const dist: number[][] = points.map((a) =>
    points.map((b) => haversineKm(a, b) * ROAD_DISTANCE_FACTOR),
  );

  // Point indices 1..n are the stops; find the cheapest order to visit them.
  const stopPoints = stops.map((_, i) => i + 1);
  const bestOrder =
    stops.length <= BRUTE_FORCE_LIMIT
      ? bruteForce(stopPoints, dist)
      : nearestNeighbourThen2Opt(stopPoints, dist);

  const order: RouteStop[] = [];
  let prev = 0;
  for (const point of bestOrder) {
    const stopIndex = point - 1;
    order.push({
      index: stopIndex,
      location: stops[stopIndex]!,
      fromPreviousKm: round2(dist[prev]![point]!),
    });
    prev = point;
  }
  const totalKm = round2(loopCost(bestOrder, dist));
  return { order, totalKm, drivingMinutes: drivingMinutesForRoadKm(totalKm) };
}

/** Cost of the closed loop home → seq → home. */
function loopCost(seq: readonly number[], dist: number[][]): number {
  if (seq.length === 0) return 0;
  let total = dist[0]![seq[0]!]!;
  for (let i = 0; i < seq.length - 1; i++) total += dist[seq[i]!]![seq[i + 1]!]!;
  return total + dist[seq[seq.length - 1]!]![0]!;
}

/** Exact TSP for small instances: evaluate every permutation. */
function bruteForce(stops: readonly number[], dist: number[][]): number[] {
  let best = [...stops];
  let bestCost = loopCost(best, dist);
  permute([...stops], 0, (perm) => {
    const cost = loopCost(perm, dist);
    if (cost < bestCost) {
      bestCost = cost;
      best = [...perm];
    }
  });
  return best;
}

/** Recursively visit every permutation of `arr` in place. */
function permute(arr: number[], k: number, visit: (p: readonly number[]) => void): void {
  if (k === arr.length) {
    visit(arr);
    return;
  }
  for (let i = k; i < arr.length; i++) {
    [arr[k]!, arr[i]!] = [arr[i]!, arr[k]!];
    permute(arr, k + 1, visit);
    [arr[k]!, arr[i]!] = [arr[i]!, arr[k]!];
  }
}

/** Heuristic TSP for larger instances: greedy build, then 2-opt polish. */
function nearestNeighbourThen2Opt(stops: readonly number[], dist: number[][]): number[] {
  const remaining = new Set(stops);
  const route: number[] = [];
  let current = 0;
  while (remaining.size > 0) {
    let nearest = -1;
    let nearestDist = Infinity;
    for (const s of remaining) {
      if (dist[current]![s]! < nearestDist) {
        nearestDist = dist[current]![s]!;
        nearest = s;
      }
    }
    route.push(nearest);
    remaining.delete(nearest);
    current = nearest;
  }
  // 2-opt: reverse any segment that shortens the loop, until stable.
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const candidate = [
          ...route.slice(0, i),
          ...route.slice(i, j + 1).reverse(),
          ...route.slice(j + 1),
        ];
        if (loopCost(candidate, dist) < loopCost(route, dist) - 1e-9) {
          route.splice(0, route.length, ...candidate);
          improved = true;
        }
      }
    }
  }
  return route;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
