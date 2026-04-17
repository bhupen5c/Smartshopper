'use client';

import { CheckCircle2, Truck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/motion';
import { formatAUD } from '@/lib/utils';
import { DEMO_DELIVERY } from '@/lib/demo-data';

export function Delivery() {
  return (
    <section id="delivery" className="border-t bg-muted/30">
      <div className="container py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
          <FadeIn direction="left"><div>
            <Badge variant="secondary" className="w-fit gap-1">
              <Truck className="size-3.5" aria-hidden />
              Deep fulfilment analysis
            </Badge>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Should you drive, click-and-collect, or get it delivered?
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              We score every fulfilment option with the same formula — subtotal + fees + fuel cost
              (distance × $/km × 2) + value of your time − loyalty rebate — so the &ldquo;cheapest&rdquo;
              option actually accounts for your real-world costs, not just the supermarket&apos;s
              sticker price.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                'Distance from your home rolled in via the ATO $0.88/km default (you can override).',
                'Time in car and in-store charged at your hourly time value.',
                'Free-delivery thresholds and subscriptions (e.g. Delivery Unlimited) applied automatically.',
                'Flybuys & Everyday Rewards rebates subtracted when eligible.',
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div></FadeIn>

          <StaggerChildren className="flex flex-col gap-3">
            {DEMO_DELIVERY.map((row) => (
              <StaggerItem key={row.retailer + row.mode}><Card className={`transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${row.isBest ? 'border-primary' : ''}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base">
                      {row.retailer} · {row.mode}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{row.explanation}</p>
                  </div>
                  {row.isBest && <Badge variant="savings">Best for you</Badge>}
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-2 text-xs">
                  <Stat label="Fee" value={formatAUD(row.fee)} />
                  <Stat label="Drive" value={`${row.distanceKm.toFixed(1)} km`} />
                  <Stat label="Time" value={`${row.driveMinutes} min`} />
                  <Stat label="Total" value={formatAUD(row.total)} emphasis />
                </CardContent>
              </Card></StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="rounded-md border bg-card p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`tabular ${emphasis ? 'font-display text-sm font-semibold' : 'font-medium'}`}>
        {value}
      </p>
    </div>
  );
}
