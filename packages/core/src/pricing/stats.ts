/**
 * Small, dependency-free stats helpers tuned for price series.
 * All functions are pure and treat the input as immutable.
 */

/** Ascending-sorted copy — useful before repeated percentile calls. */
export function sortedAsc(values: readonly number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

/** Percentile of a value within a series (fraction of series <= value). Returns 0..1. */
export function percentileRank(value: number, series: readonly number[]): number {
  if (series.length === 0) return 0;
  let le = 0;
  for (const v of series) if (v <= value) le++;
  return le / series.length;
}

/** Quantile of a sorted series using linear interpolation. q in [0,1]. */
export function quantileSorted(sortedSeries: readonly number[], q: number): number {
  const n = sortedSeries.length;
  if (n === 0) return Number.NaN;
  if (n === 1) return sortedSeries[0]!;
  const clamped = Math.min(1, Math.max(0, q));
  const pos = clamped * (n - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  const frac = pos - lo;
  return sortedSeries[lo]! * (1 - frac) + sortedSeries[hi]! * frac;
}

export function quantile(series: readonly number[], q: number): number {
  return quantileSorted(sortedAsc(series), q);
}

export function min(series: readonly number[]): number {
  if (series.length === 0) return Number.NaN;
  let m = series[0]!;
  for (let i = 1; i < series.length; i++) if (series[i]! < m) m = series[i]!;
  return m;
}

export function max(series: readonly number[]): number {
  if (series.length === 0) return Number.NaN;
  let m = series[0]!;
  for (let i = 1; i < series.length; i++) if (series[i]! > m) m = series[i]!;
  return m;
}

export function mean(series: readonly number[]): number {
  if (series.length === 0) return Number.NaN;
  let s = 0;
  for (const v of series) s += v;
  return s / series.length;
}

/**
 * Mean ignoring the lowest `lowerTrim` and highest `upperTrim` fractions.
 * Used to derive a "normal" non-promotional baseline that is robust to half-price events.
 */
export function trimmedMean(
  series: readonly number[],
  { lowerTrim = 0.2, upperTrim = 0.05 } = {},
): number {
  const n = series.length;
  if (n === 0) return Number.NaN;
  const sorted = sortedAsc(series);
  const loIdx = Math.floor(n * lowerTrim);
  const hiIdx = Math.ceil(n * (1 - upperTrim));
  const slice = sorted.slice(loIdx, Math.max(hiIdx, loIdx + 1));
  return mean(slice);
}

/** Biased standard deviation. */
export function stddev(series: readonly number[]): number {
  const n = series.length;
  if (n === 0) return Number.NaN;
  const m = mean(series);
  let acc = 0;
  for (const v of series) {
    const d = v - m;
    acc += d * d;
  }
  return Math.sqrt(acc / n);
}
