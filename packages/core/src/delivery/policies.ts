/**
 * Default delivery policies for the AU supermarkets we track.
 * These are sensible starting values as at early 2026; real figures are
 * loaded from the database at runtime and updated by the scrapers.
 */
export interface DeliveryPolicy {
  retailerCode: string;
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
    minimumSpend: 50,
    freeDeliveryThreshold: 250,
    defaultDeliveryFee: 11,
    clickAndCollectFee: 0,
    clickAndCollectMinimum: 50,
    tiers: [
      { label: 'Anytime', windowStart: '08:00', windowEnd: '22:00', fee: 11, weekdays: [0, 1, 2, 3, 4, 5, 6] },
    ],
    subscriptions: [
      { code: 'coles_plus', label: 'Coles Plus', monthlyCost: 19, reducesFeeToZero: true },
    ],
  },
  woolworths: {
    retailerCode: 'woolworths',
    minimumSpend: 50,
    freeDeliveryThreshold: 300,
    defaultDeliveryFee: 12,
    clickAndCollectFee: 0,
    clickAndCollectMinimum: 50,
    tiers: [
      { label: 'Morning', windowStart: '06:00', windowEnd: '10:00', fee: 9, weekdays: [1, 2, 3, 4, 5] },
      { label: 'Peak', windowStart: '16:00', windowEnd: '19:00', fee: 15, weekdays: [1, 2, 3, 4, 5] },
      { label: 'Weekend', windowStart: '08:00', windowEnd: '20:00', fee: 12, weekdays: [0, 6] },
    ],
    subscriptions: [
      { code: 'delivery_unlimited', label: 'Delivery Unlimited', monthlyCost: 19, reducesFeeToZero: true },
    ],
  },
  aldi: {
    retailerCode: 'aldi',
    minimumSpend: 0,
    freeDeliveryThreshold: null,
    // ALDI ships via couriers (e.g. Sendle) for online orders; no supermarket-style delivery.
    defaultDeliveryFee: 0,
    clickAndCollectFee: 0,
    clickAndCollectMinimum: 0,
    tiers: [],
    subscriptions: [],
  },
  iga: {
    retailerCode: 'iga',
    minimumSpend: 40,
    freeDeliveryThreshold: 150,
    defaultDeliveryFee: 10,
    clickAndCollectFee: 0,
    clickAndCollectMinimum: 30,
    tiers: [],
    subscriptions: [],
  },
};
