import { trimmedMean, quantile } from './stats.js';

/**
 * Represents a single day's cheapest observed price for one retailer product.
 * We bucket per-day because retailers change prices multiple times per day
 * and we care about the "true" daily low for trend analysis.
 */
export interface DailyPrice {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  price: number;
}

/**
 * Compute a trimmed-mean baseline of "normal" (non-promotional) prices over a window.
 * - Trims the cheapest 20% (treats those as promotional days)
 * - Trims the most expensive 5% (outlier price spikes)
 *
 * This is dramatically more robust than trusting the retailer's `was_price` field,
 * which is frequently inflated to make specials look bigger.
 */
export function trimmedBaseline(series: readonly DailyPrice[]): number {
  const prices = series.map((d) => d.price);
  return trimmedMean(prices, { lowerTrim: 0.2, upperTrim: 0.05 });
}

/** Bucket a stream of price snapshots into one daily low per day. */
export function toDailyLows(
  snapshots: readonly { price: number; scrapedAt: string | Date }[],
): DailyPrice[] {
  const byDay = new Map<string, number>();
  for (const s of snapshots) {
    const d = typeof s.scrapedAt === 'string' ? new Date(s.scrapedAt) : s.scrapedAt;
    const key = d.toISOString().slice(0, 10);
    const cur = byDay.get(key);
    if (cur === undefined || s.price < cur) byDay.set(key, s.price);
  }
  return Array.from(byDay.entries())
    .map(([date, price]) => ({ date, price }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Keep only entries within the last `days` days from `now`. */
export function windowDays(
  series: readonly DailyPrice[],
  days: number,
  now: Date = new Date(),
): DailyPrice[] {
  const cutoff = new Date(now.getTime() - days * 86_400_000).toISOString().slice(0, 10);
  return series.filter((d) => d.date >= cutoff);
}

/** Price below which a day is considered "promotional" for a product. */
export function promotionalThreshold(series: readonly DailyPrice[]): number {
  return quantile(
    series.map((d) => d.price),
    0.2,
  );
}
