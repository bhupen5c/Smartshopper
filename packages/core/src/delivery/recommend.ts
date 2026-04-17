import { quoteFulfilment } from './quote.js';
import type { QuoteInput, Quote, FulfilmentMode } from './quote.js';

/**
 * Rank every plausible fulfilment option for a given retailer & basket and
 * return them cheapest-first. Ineligible options are included with their
 * reason so the UI can show "would have worked if basket was $X more".
 */
export function recommendFulfilment(input: QuoteInput): Quote[] {
  const modes: FulfilmentMode[] = input.storeLocation
    ? ['delivery', 'click_and_collect', 'direct_to_boot', 'in_store_pickup']
    : ['delivery'];

  const quotes = modes.map((mode) => quoteFulfilment(input, mode));

  // Eligible quotes sorted by total cost; ineligibles appended at the end.
  const eligible = quotes.filter((q) => q.eligible).sort((a, b) => a.totalCost - b.totalCost);
  const ineligible = quotes.filter((q) => !q.eligible);
  return [...eligible, ...ineligible];
}

/** Return the single best recommendation, or null if nothing is eligible. */
export function bestFulfilment(input: QuoteInput): Quote | null {
  const ranked = recommendFulfilment(input);
  return ranked.find((q) => q.eligible) ?? null;
}
