/**
 * Input types for the basket optimiser. We duck-type these here rather than
 * importing @smartshopper/types to keep @smartshopper/core standalone-testable
 * (the types package is still the source of truth for wire formats).
 */

import type { LatLng } from '../geo.js';

export interface OptimiserItem {
  /** Stable identifier of the shopping-list line. */
  listItemId: string;
  /** Canonical product id (null = unresolved free-text). */
  productId: string;
  /** Display name. */
  productName: string;
  quantity: number;
}

export interface OptimiserOffer {
  /** The retailer selling the product. */
  retailerCode: string;
  /** retailer-specific SKU id. */
  retailerProductId: string;
  /** Product we're offering. */
  productId: string;
  productName: string;
  /** Current live price. */
  price: number;
  /** Cheapest nearby store for this retailer (null for delivery-only retailers). */
  storeId: string | null;
  storeLocation: LatLng | null;
  /** Distance from user's home, km (0 for delivery-only). */
  distanceKm: number;
  /** Flags we pass through for scoring / display. */
  isTrueSpecial: boolean;
  memberOnly: boolean;
  inStock: boolean;
}

export interface OptimiserPreferences {
  origin: LatLng;
  maxStores: number;
  maxTravelKm: number;
  fuelCostPerKm: number;
  timeValuePerHour: number;
  allowedRetailers: readonly string[];
  loyaltyMemberships: readonly string[];
  activeSubscriptions: readonly string[];
  /** If true, exclude any option that requires physically visiting a store. */
  noCarAvailable: boolean;
}

export interface OptimiserLine {
  listItemId: string;
  productId: string;
  productName: string;
  retailerCode: string;
  retailerProductId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isTrueSpecial: boolean;
  memberOnly: boolean;
}

export interface OptimiserLineAlternative {
  listItemId: string;
  cheaperRetailerCode: string;
  cheaperPrice: number;
  /** How much this line would cost less at the cheaper retailer. */
  savingsPerUnit: number;
}

export interface OptimiserPlan {
  kind: 'single_retailer' | 'multi_retailer' | 'delivery_only';
  /** Lines, one per shopping-list item. */
  lines: OptimiserLine[];
  /** Stores/retailers visited or ordered from. */
  retailerCodes: string[];
  /** Itemised totals. */
  subtotal: number;
  totalFees: number;
  totalTravelCost: number;
  totalTimeCost: number;
  totalLoyaltyRebate: number;
  grandTotal: number;
  /** How many line items we could fulfil; might be < items.length. */
  coverage: number;
  /** Items we could not source from any allowed retailer. */
  missingItemIds: string[];
  explanation: string;
  /**
   * How much this plan saves vs. the best single-retailer plan.
   * Positive = this plan is cheaper. Null on the single-retailer plan itself.
   */
  savingsVsBestSingle?: number | null;
  /**
   * Per-line annotations flagging items that would be cheaper at another
   * retailer. Used by the UI to show "cheaper elsewhere" hints so users
   * can see the math behind splitting or staying put.
   */
  lineAlternatives?: OptimiserLineAlternative[];
}
