import { describe, expect, it } from 'vitest';
import { planRoute } from '../basket/route.js';
import { haversineKm, ROAD_DISTANCE_FACTOR } from '../geo.js';

const HOME = { lat: 0, lng: 0 };

describe('planRoute', () => {
  it('returns an empty loop for no stops', () => {
    const r = planRoute(HOME, []);
    expect(r.order).toEqual([]);
    expect(r.totalKm).toBe(0);
    expect(r.drivingMinutes).toBe(0);
  });

  it('routes a single stop as a there-and-back trip', () => {
    const stop = { lat: 0, lng: 0.05 };
    const r = planRoute(HOME, [stop]);
    expect(r.order).toHaveLength(1);
    expect(r.order[0]!.index).toBe(0);
    const leg = haversineKm(HOME, stop) * ROAD_DISTANCE_FACTOR;
    expect(r.order[0]!.fromPreviousKm).toBeCloseTo(leg, 1);
    expect(r.totalKm).toBeCloseTo(leg * 2, 1);
  });

  it('finds the shortest loop through collinear stops', () => {
    // Three stops on one ray out from home — the optimal loop reaches the
    // farthest stop and comes straight back, collecting the rest en route.
    // Its length is exactly twice the distance to the farthest stop.
    const near = { lat: 0, lng: 0.01 };
    const mid = { lat: 0, lng: 0.02 };
    const far = { lat: 0, lng: 0.03 };
    // Passed deliberately out of order — the planner must reorder them.
    const r = planRoute(HOME, [far, near, mid]);
    expect(r.order).toHaveLength(3);
    expect(new Set(r.order.map((s) => s.index)).size).toBe(3);
    const optimal = 2 * haversineKm(HOME, far) * ROAD_DISTANCE_FACTOR;
    expect(r.totalKm).toBeCloseTo(optimal, 1);
  });

  it('visits every stop exactly once for a large basket', () => {
    // 11 stops exercises the nearest-neighbour + 2-opt heuristic path.
    const stops = Array.from({ length: 11 }, (_, i) => ({
      lat: (i % 3) * 0.01,
      lng: Math.floor(i / 3) * 0.01,
    }));
    const r = planRoute(HOME, stops);
    expect(r.order).toHaveLength(11);
    expect(new Set(r.order.map((s) => s.index)).size).toBe(11);
    expect(r.totalKm).toBeGreaterThan(0);
    expect(r.drivingMinutes).toBeGreaterThan(0);
  });
});
