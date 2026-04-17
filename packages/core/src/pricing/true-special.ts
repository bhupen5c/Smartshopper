import type { DailyPrice } from './baseline.js';
import { quantile, min } from './stats.js';

export interface TrueSpecialInput {
  /** Current special price being evaluated. */
  specialPrice: number;
  /** Daily low price series (typically 180 days). */
  history: readonly DailyPrice[];
  /** The most recent cycle's low, if known — further strengthens the judgement. */
  previousCycleLow?: number;
  /** The trimmed baseline over the history window. */
  baseline?: number;
}

export interface TrueSpecialResult {
  isTrue: boolean;
  /** 0..1 score. Higher = more genuine a deal. */
  confidence: number;
  /** Plain-English reasons behind the verdict (for UX tooltips). */
  reasons: string[];
}

/**
 * Classify a special as genuinely cheap ("true") or cosmetic.
 *
 * A special is *true* when all of:
 *   (1) the price is at or below the 20th percentile of the last 180 days
 *   (2) the price is at or below the previous cycle's low (if we have one)
 *   (3) the price is at least 15% below the trimmed baseline (if we have one)
 *
 * Any two-of-three with a strong (1) also passes. We return a confidence score
 * so the UI can shade a badge ("great deal" vs "ok deal") rather than just binary.
 */
export function classifyTrueSpecial(input: TrueSpecialInput): TrueSpecialResult {
  const reasons: string[] = [];
  const prices = input.history.map((d) => d.price);

  if (prices.length === 0) {
    return { isTrue: false, confidence: 0, reasons: ['No price history yet.'] };
  }

  const p20 = quantile(prices, 0.2);
  const p5 = quantile(prices, 0.05);
  const lowestEver = min(prices);

  const atOrBelowP20 = input.specialPrice <= p20 + 1e-9;
  const atOrBelowPrevLow =
    input.previousCycleLow === undefined || input.specialPrice <= input.previousCycleLow + 1e-9;
  const deeplyDiscounted =
    input.baseline !== undefined && input.specialPrice <= input.baseline * 0.85;

  // Score contributions
  let score = 0;
  if (atOrBelowP20) {
    score += 0.45;
    reasons.push(`Price sits in the cheapest 20% of the last ${input.history.length} days.`);
  }
  if (input.specialPrice <= p5 + 1e-9) {
    score += 0.15;
    reasons.push('Price is near the cheapest 5% ever seen in the window.');
  }
  if (atOrBelowPrevLow) {
    score += 0.15;
    if (input.previousCycleLow !== undefined) {
      reasons.push(
        `Matches or beats the previous cycle low of $${input.previousCycleLow.toFixed(2)}.`,
      );
    }
  }
  if (deeplyDiscounted) {
    score += 0.2;
    reasons.push(
      `At least 15% below the ${input.baseline!.toFixed(2)} trimmed-mean baseline — meaningful drop.`,
    );
  }
  if (input.specialPrice <= lowestEver + 1e-9) {
    score += 0.15;
    reasons.push(`Ties the lowest price seen in the last ${input.history.length} days.`);
  }

  if (!atOrBelowP20) {
    reasons.push('Price is above the 20th-percentile mark — likely a cosmetic discount.');
  }

  const confidence = Math.min(1, score);
  // "True" requires the price to be in the lowest 20% of the window AND at least one of:
  //   (a) the discount vs baseline is meaningful (≥15% below), OR
  //   (b) the price matches or beats the previous cycle's known low.
  // Without either signal we fall back to requiring a very low p5 rank.
  const hasPrevLowSignal = input.previousCycleLow !== undefined && atOrBelowPrevLow;
  const atOrBelowP5 = input.specialPrice <= quantile(prices, 0.05) + 1e-9;
  const isTrue = atOrBelowP20 && (deeplyDiscounted || hasPrevLowSignal || atOrBelowP5);
  return { isTrue, confidence, reasons };
}
