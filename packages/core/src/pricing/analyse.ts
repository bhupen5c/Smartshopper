import { promotionalThreshold, toDailyLows, trimmedBaseline, windowDays } from './baseline.js';
import type { DailyPrice } from './baseline.js';
import { detectCycleDays, predictNextDropDate } from './cycle.js';
import { max, min, percentileRank, quantile } from './stats.js';
import { classifyTrueSpecial } from './true-special.js';

export interface PriceAnalyticsResult {
  currentPrice: number;
  low30d: number | null;
  low90d: number | null;
  low365d: number | null;
  high365d: number | null;
  baseline90d: number | null;
  percentileRank90d: number | null;
  percentileRank365d: number | null;
  discountVsBaseline: number | null;
  cycleDays: number;
  cycleStrength: number;
  nextPredictedDropAt: string | null;
  isTrueSpecial: boolean;
  specialConfidence: number;
  specialReasons: string[];
  computedAt: string;
}

/**
 * One-shot analyser: takes raw snapshots (any granularity) and produces the full analytics row.
 * Keeps all work in a single pass where possible; each reduction is O(n).
 */
export function analysePriceHistory(
  snapshots: readonly { price: number; scrapedAt: string | Date }[],
  now: Date = new Date(),
): PriceAnalyticsResult | null {
  if (snapshots.length === 0) return null;

  const daily: DailyPrice[] = toDailyLows(snapshots);
  if (daily.length === 0) return null;

  const current = daily.at(-1)!;
  const last30 = windowDays(daily, 30, now);
  const last90 = windowDays(daily, 90, now);
  const last365 = windowDays(daily, 365, now);
  const last180 = windowDays(daily, 180, now);

  const low30d = last30.length > 0 ? min(last30.map((d) => d.price)) : null;
  const low90d = last90.length > 0 ? min(last90.map((d) => d.price)) : null;
  const low365d = last365.length > 0 ? min(last365.map((d) => d.price)) : null;
  const high365d = last365.length > 0 ? max(last365.map((d) => d.price)) : null;

  const baseline90d = last90.length >= 14 ? trimmedBaseline(last90) : null;
  const percentileRank90d =
    last90.length > 0 ? percentileRank(current.price, last90.map((d) => d.price)) : null;
  const percentileRank365d =
    last365.length > 0 ? percentileRank(current.price, last365.map((d) => d.price)) : null;
  const discountVsBaseline =
    baseline90d !== null && baseline90d > 0 ? current.price / baseline90d - 1 : null;

  const cycle = detectCycleDays(last180);
  const nextPredictedDropAt =
    cycle.cycleDays > 0
      ? predictNextDropDate(last180, cycle.cycleDays, quantile(last180.map((d) => d.price), 0.2), now)
      : null;

  const promoThreshold = last180.length > 0 ? promotionalThreshold(last180) : null;
  const previousCycleLow = findPreviousCycleLow(last180, cycle.cycleDays, promoThreshold);

  const trueSpecial = classifyTrueSpecial({
    specialPrice: current.price,
    history: last180,
    previousCycleLow: previousCycleLow ?? undefined,
    baseline: baseline90d ?? undefined,
  });

  return {
    currentPrice: current.price,
    low30d,
    low90d,
    low365d,
    high365d,
    baseline90d,
    percentileRank90d,
    percentileRank365d,
    discountVsBaseline,
    cycleDays: cycle.cycleDays,
    cycleStrength: cycle.strength,
    nextPredictedDropAt,
    isTrueSpecial: trueSpecial.isTrue,
    specialConfidence: trueSpecial.confidence,
    specialReasons: trueSpecial.reasons,
    computedAt: now.toISOString(),
  };
}

/** Find the lowest price in the previous cycle window, to compare against the current special. */
function findPreviousCycleLow(
  series: readonly DailyPrice[],
  cycleDays: number,
  promoThreshold: number | null,
): number | null {
  if (cycleDays <= 0 || series.length < cycleDays * 2 || promoThreshold === null) return null;
  const cutoff = series.length - cycleDays;
  const previousWindow = series.slice(Math.max(0, cutoff - cycleDays), cutoff);
  const promoDays = previousWindow.filter((d) => d.price <= promoThreshold);
  if (promoDays.length === 0) return null;
  return min(promoDays.map((d) => d.price));
}
