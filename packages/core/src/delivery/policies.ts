/**
 * Default delivery policies for the AU supermarkets we track.
 *
 * Minimum spends, free-delivery thresholds and subscription costs reflect
 * each retailer's published terms as at May 2026. Per-slot delivery fees
 * vary with demand, so the fee amounts here are representative estimates;
 * all of it is overridden at runtime by scraped data when available.
 *
 * - Coles and Woolworths run first-party home delivery + click & collect.
 * - ALDI is in-store only — its sole delivery channel is the DoorDash
 *   marketplace (third-party, limited areas), which this first-party model
 *   doesn't cover, so delivery and click & collect are marked unavailable.
 * - IGA stores are independently owned, so terms vary store to store; the
 *   values here are a representative metro estimate.
 */
export interface DeliveryPolicy {
  retailerCode: string;
  /** Whether the retailer runs first-party home delivery at all. */
  offersDelivery: boolean;
  /** Whether the retailer offers click & collect / direct-to-boot. */
  offersClickAndCollect: boolean;
  minimumSpend: number;
  freeDeliveryThreshold: number | null;
  defaultDeliveryFee: number;
  clickAndCollectFee: number;
  clickAndCollectMinimum: number;
  tiers: Array<{
    label: string;
    windowStart: string;
    windowEnd: string;
    fee: number;
    weekdays: number[];
  }>;
  subscriptions: Array<{
    code: string;
    label: string;
    monthlyCost: number;
    reducesFeeToZero: boolean;
  }>;
}

export const DEFAULT_DELIVERY_POLICIES: Record<string, DeliveryPolicy> = {
  coles: {
    retailerCode: 'coles',
    offersDelivery: true,
    offersClickAndCollect: true,
    minimumSpend: 50,
    // Non-members get free delivery only on orders of $250+.
    freeDeliveryThreshold: 250,
    defaultDeliveryFee: 11,
    clickAndCollectFee: 0,
    // Rapid Click & Collect is free from a $30 order.
    clickAndCollectMinimum: 30,
    tiers: [
      { label: 'Anytime', windowStart: '08:00', windowEnd: '22:00', fee: 11, weekdays: [0, 1, 2, 3, 4, 5, 6] },
    ],
    subscriptions: [
      // Coles Plus — $19/mo or $199/yr; zeroes delivery fees on $50+ orders.
      { code: 'coles_plus', label: 'Coles Plus', monthlyCost: 19, reducesFeeToZero: true },
    ],
  },
  woolworths: {
    retailerCode: 'woolworths',
    offersDelivery: true,
    offersClickAndCollect: true,
    minimumSpend: 50,
    // Non-members get free delivery on orders of $150+.
    freeDeliveryThreshold: 150,
    defaultDeliveryFee: 12,
    clickAndCollectFee: 0,
    clickAndCollectMinimum: 50,
    tiers: [
      { label: 'Morning', windowStart: '06:00', windowEnd: '10:00', fee: 9, weekdays: [1, 2, 3, 4, 5] },
      { label: 'Peak', windowStart: '16:00', windowEnd: '19:00', fee: 15, weekdays: [1, 2, 3, 4, 5] },
      { label: 'Weekend', windowStart: '08:00', windowEnd: '20:00', fee: 12, weekdays: [0, 6] },
    ],
    subscriptions: [
      // Delivery Unlimited — $15/mo, or $10/mo billed annually.
      { code: 'delivery_unlimited', label: 'Delivery Unlimited', monthlyCost: 15, reducesFeeToZero: true },
    ],
  },
  aldi: {
    retailerCode: 'aldi',
    // ALDI is in-store only — no first-party delivery or click & collect.
    // (Its DoorDash service is a separate third-party marketplace.)
    offersDelivery: false,
    offersClickAndCollect: false,
    minimumSpend: 0,
    freeDeliveryThreshold: null,
    defaultDeliveryFee: 0,
    clickAndCollectFee: 0,
    clickAndCollectMinimum: 0,
    tiers: [],
    subscriptions: [],
  },
  iga: {
    retailerCode: 'iga',
    // Independently-owned stores — terms vary; these are metro estimates.
    offersDelivery: true,
    offersClickAndCollect: true,
    minimumSpend: 40,
    // No uniform free-delivery threshold across independent IGA stores.
    freeDeliveryThreshold: null,
    defaultDeliveryFee: 10,
    clickAndCollectFee: 0,
    clickAndCollectMinimum: 30,
    tiers: [],
    subscriptions: [],
  },
};
