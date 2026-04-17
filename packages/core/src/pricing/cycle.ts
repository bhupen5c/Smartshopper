import type { DailyPrice } from './baseline.js';
import { mean } from './stats.js';

/**
 * Detect the dominant cycle (in days) in a daily price series.
 *
 * Implementation: direct autocorrelation over candidate lags 7..56.
 * That range covers the typical AU supermarket promotional cycles (weekly, 4, 6, 8-week).
 * We return the lag with the highest normalised autocorrelation, provided it clears
 * a minimum strength threshold. Uses a pre-computed variance for speed; O(n · lags).
 *
 * Returns 0 if no significant cycle is detected or the series is too short.
 */
export function detectCycleDays(
  series: readonly DailyPrice[],
  options: { minLag?: number; maxLag?: number; minStrength?: number } = {},
): { cycleDays: number; strength: number } {
  const { minLag = 7, maxLag = 56, minStrength = 0.35 } = options;
  if (series.length < maxLag * 2) return { cycleDays: 0, strength: 0 };

  const prices = series.map((d) => d.price);
  const m = mean(prices);
  const centred = prices.map((p) => p - m);

  let denom = 0;
  for (const v of centred) denom += v * v;
  if (denom === 0) return { cycleDays: 0, strength: 0 };

  let bestLag = 0;
  let bestCorr = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let num = 0;
    for (let i = 0; i + lag < centred.length; i++) num += centred[i]! * centred[i + lag]!;
    const corr = num / denom;
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  if (bestCorr < minStrength) return { cycleDays: 0, strength: bestCorr };
  return { cycleDays: bestLag, strength: bestCorr };
}

/**
 * Given a detected cycle, predict the next day we'd expect the price to drop below
 * its baseline. We locate the most recent "promotional" day (price below threshold)
 * and project forward by one cycle length.
 */
export function predictNextDropDate(
  series: readonly DailyPrice[],
  cycleDays: number,
  promotionalThresholdPrice: number,
  now: Date = new Date(),
): string | null {
  if (cycleDays <= 0 || series.length === 0) return null;

  let lastPromo: string | null = null;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i]!.price <= promotionalThresholdPrice) {
      lastPromo = series[i]!.date;
      break;
    }
  }
  if (!lastPromo) return null;

  const last = new Date(`${lastPromo}T00:00:00Z`);
  let next = new Date(last.getTime() + cycleDays * 86_400_000);
  // If "next" is already in the past, project forward one more cycle.
  while (next.getTime() < now.getTime()) {
    next = new Date(next.getTime() + cycleDays * 86_400_000);
  }
  return next.toISOString();
}
