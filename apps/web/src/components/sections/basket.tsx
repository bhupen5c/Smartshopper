import { Check } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAUD } from '@/lib/utils';

const DEMO_LIST = [
  { name: 'Milk 2 L', retailer: 'Coles', price: 3.2, special: true },
  { name: 'Weet-Bix 1.2 kg', retailer: 'Woolies', price: 5.25, special: true },
  { name: 'Bananas 1 kg', retailer: 'ALDI', price: 2.5, special: false },
  { name: 'Greek yoghurt 1 kg', retailer: 'Coles', price: 7.0, special: false },
  { name: 'Olive oil 750 ml', retailer: 'Woolies', price: 9.9, special: true },
  { name: 'Eggs 12 pk free range', retailer: 'ALDI', price: 5.2, special: false },
];

const DEMO_PLAN = {
  subtotal: 33.05,
  fees: 0,
  travel: 2.2,
  time: 3.75,
  loyalty: 0.32,
  grandTotal: 38.68,
  savings: 9.4,
  stores: 3,
};

export function Basket() {
  return (
    <section id="basket" className="container py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Cheapest basket, across every retailer</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Drop in a shopping list, tell us your home postcode and how many stores you&apos;re
            willing to visit. We pick the retailer for every item, taking into account distance,
            fuel, your time and any loyalty rebates you earn.
          </p>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Optimised plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ul className="divide-y">
                {DEMO_LIST.map((row) => (
                  <li key={row.name} className="flex items-center justify-between gap-3 py-2">
                    <div className="flex items-center gap-3">
                      <Check className="size-4 text-primary" aria-hidden />
                      <span className="font-medium">{row.name}</span>
                      {row.special && (
                        <Badge variant="savings" className="text-[10px]">
                          true special
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {row.retailer}
                      </span>
                      <span className="tabular font-display font-semibold">{formatAUD(row.price)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                Plan summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Subtotal" value={formatAUD(DEMO_PLAN.subtotal)} />
              <Row label="Delivery/pickup fees" value={formatAUD(DEMO_PLAN.fees)} />
              <Row label="Travel cost (fuel × distance)" value={formatAUD(DEMO_PLAN.travel)} />
              <Row label="Time cost (driving + in-store)" value={formatAUD(DEMO_PLAN.time)} />
              <Row label="Loyalty rebate" value={`− ${formatAUD(DEMO_PLAN.loyalty)}`} accent />
              <div className="flex items-center justify-between border-t pt-3 text-base">
                <span className="font-medium">Grand total</span>
                <span className="tabular font-display text-2xl font-semibold">
                  {formatAUD(DEMO_PLAN.grandTotal)}
                </span>
              </div>
              <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">
                Saves {formatAUD(DEMO_PLAN.savings)} vs the cheapest single-retailer plan. Visits
                {` ${DEMO_PLAN.stores} `} stores within 5 km of your postcode.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                Preferences we respect
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <Pref label="Home postcode" value="3000" />
              <Pref label="Max stores" value="3" />
              <Pref label="Max travel" value="5 km" />
              <Pref label="Fuel cost" value="$0.88 / km" />
              <Pref label="Time value" value="$25 / h" />
              <Pref label="Loyalty" value="Flybuys + Everyday" />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular ${accent ? 'text-primary' : ''}`}>{value}</span>
    </div>
  );
}

function Pref({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
