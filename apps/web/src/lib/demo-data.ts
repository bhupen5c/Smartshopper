/**
 * Demo data that makes the landing page feel alive until the scrapers + DB are wired up.
 * Every value here is illustrative; the real figures come from the price pipeline later.
 */

import { analysePriceHistory } from '@smartshopper/core/pricing';

export interface DemoProduct {
  id: string;
  name: string;
  retailer: string;
  size: string;
  currentPrice: number;
  baseline: number;
  low90d: number;
  high365d: number;
  percentileRank90d: number;
  cycleDays: number;
  history: number[]; // last 30 daily lows
  memberOnly: boolean;
  isTrueSpecial: boolean;
  category: string;
}

function makeHistory(cycle: number, base: number, lowFactor = 0.5, days = 90): number[] {
  return Array.from({ length: days }, (_, i) => (i % cycle === 0 ? +(base * lowFactor).toFixed(2) : base));
}

function buildDemoProduct(cfg: {
  id: string;
  name: string;
  retailer: string;
  size: string;
  category: string;
  base: number;
  currentFactor: number;
  cycle: number;
  memberOnly?: boolean;
}): DemoProduct {
  const history = makeHistory(cfg.cycle, cfg.base);
  const currentPrice = +(cfg.base * cfg.currentFactor).toFixed(2);
  history.push(currentPrice);

  const snapshots = history.map((price, i) => ({
    price,
    scrapedAt: new Date(Date.now() - (history.length - 1 - i) * 86_400_000).toISOString(),
  }));
  const analytics = analysePriceHistory(snapshots) ?? {
    currentPrice,
    baseline90d: cfg.base,
    low90d: +(cfg.base * 0.5).toFixed(2),
    high365d: cfg.base,
    percentileRank90d: 0.5,
    cycleDays: cfg.cycle,
    isTrueSpecial: false,
  };

  return {
    id: cfg.id,
    name: cfg.name,
    retailer: cfg.retailer,
    size: cfg.size,
    category: cfg.category,
    currentPrice,
    baseline: analytics.baseline90d ?? cfg.base,
    low90d: analytics.low90d ?? +(cfg.base * 0.5).toFixed(2),
    high365d: analytics.high365d ?? cfg.base,
    percentileRank90d: analytics.percentileRank90d ?? 0.5,
    cycleDays: analytics.cycleDays,
    history: history.slice(-30),
    memberOnly: cfg.memberOnly ?? false,
    isTrueSpecial: analytics.isTrueSpecial,
  };
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  buildDemoProduct({
    id: 'p1',
    name: "Arnott's Tim Tam Original",
    retailer: 'Coles',
    size: '200 g',
    category: 'Biscuits',
    base: 5.5,
    currentFactor: 0.5,
    cycle: 14,
  }),
  buildDemoProduct({
    id: 'p2',
    name: 'Cadbury Dairy Milk Block',
    retailer: 'Woolworths',
    size: '180 g',
    category: 'Chocolate',
    base: 6,
    currentFactor: 0.5,
    cycle: 14,
    memberOnly: true,
  }),
  buildDemoProduct({
    id: 'p3',
    name: 'ALDI Remano Parmesan',
    retailer: 'ALDI',
    size: '200 g',
    category: 'Dairy',
    base: 5.99,
    currentFactor: 1,
    cycle: 0,
  }),
  buildDemoProduct({
    id: 'p4',
    name: 'Pauls Milk Full Cream',
    retailer: 'IGA',
    size: '2 L',
    category: 'Dairy',
    base: 4.5,
    currentFactor: 0.85,
    cycle: 0,
  }),
  buildDemoProduct({
    id: 'p5',
    name: 'Weet-Bix Original',
    retailer: 'Coles',
    size: '1.2 kg',
    category: 'Breakfast',
    base: 9.5,
    currentFactor: 0.55,
    cycle: 21,
  }),
  buildDemoProduct({
    id: 'p6',
    name: 'Tip Top Bread',
    retailer: 'Woolworths',
    size: '700 g',
    category: 'Bakery',
    base: 4.5,
    currentFactor: 0.95,
    cycle: 0,
  }),
];

export interface DemoStat {
  label: string;
  value: string;
  sub: string;
}

export const DEMO_STATS: DemoStat[] = [
  { label: 'Retailers tracked', value: '4', sub: 'Coles · Woolies · ALDI · IGA' },
  { label: 'Products under watch', value: '45,200+', sub: 'Updated nightly' },
  { label: 'True-special accuracy', value: '91%', sub: 'Validated against 180-day lows' },
  { label: 'Avg. basket savings', value: '18%', sub: 'Per week vs single-store shop' },
];

export interface DemoDelivery {
  retailer: string;
  mode: string;
  fee: number;
  distanceKm: number;
  driveMinutes: number;
  loyaltyRebate: number;
  total: number;
  explanation: string;
  isBest?: boolean;
}

export const DEMO_DELIVERY: DemoDelivery[] = [
  {
    retailer: 'Coles',
    mode: 'Direct to Boot',
    fee: 0,
    distanceKm: 3.4,
    driveMinutes: 14,
    loyaltyRebate: 0.6,
    total: 117.8,
    explanation: '3.4 km drive, in and out in 3 minutes. Flybuys rebate applied.',
    isBest: true,
  },
  {
    retailer: 'Woolworths',
    mode: 'Delivery',
    fee: 11,
    distanceKm: 0,
    driveMinutes: 0,
    loyaltyRebate: 0.6,
    total: 129.4,
    explanation: 'Under the $300 free-delivery threshold, peak-tier fee applies.',
  },
  {
    retailer: 'ALDI',
    mode: 'In-store pickup',
    fee: 0,
    distanceKm: 5.8,
    driveMinutes: 24,
    loyaltyRebate: 0,
    total: 124.6,
    explanation: 'Cheapest shelf price, but ~24 minute round trip + 25 min in-store offsets it.',
  },
];
