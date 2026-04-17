import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEMO_STATS } from '@/lib/demo-data';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,hsl(var(--accent))_0%,transparent_60%)] opacity-70" />
      <div className="container grid gap-10 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit gap-1">
            <Sparkles className="size-3.5" aria-hidden />
            Built for Australian shoppers
          </Badge>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            Spot the <span className="text-primary">real</span> specials. Skip the fake ones.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            SmartShopper tracks every price at Coles, Woolworths, ALDI and IGA over time, flags
            genuinely low prices, forecasts the next cycle drop, optimises your basket across
            retailers, and tells you whether delivery or click-and-collect actually saves you money
            when distance and time are counted.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="#waitlist">
                Get early access
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#specials">See live specials</Link>
            </Button>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 md:grid-cols-4">
            {DEMO_STATS.map((s) => (
              <div key={s.label}>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</dt>
                <dd className="tabular font-display text-2xl font-semibold leading-none">{s.value}</dd>
                <dd className="mt-1 text-xs text-muted-foreground">{s.sub}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -left-6 -top-6 size-40 rounded-full bg-primary/20 blur-3xl"
          />
          <div className="relative rounded-2xl border bg-card/60 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Tim Tam Original 200 g
              </span>
              <Badge variant="savings">True special</Badge>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <span className="tabular font-display text-4xl font-semibold">$2.75</span>
              <span className="text-sm text-muted-foreground line-through">$5.50</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Cheapest price in 180 days. Next drop predicted in 14 days based on Coles&apos;s
              fortnightly pattern.
            </p>
            <svg viewBox="0 0 200 60" className="mt-4 h-16 w-full">
              <path
                d="M0,45 Q20,44 40,40 Q60,38 80,20 Q100,10 120,40 Q140,46 160,12 Q180,6 200,35"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
              />
            </svg>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border bg-card p-3 text-xs">
              <p className="text-muted-foreground">Baseline</p>
              <p className="tabular font-display text-lg font-semibold">$5.25</p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-xs">
              <p className="text-muted-foreground">180-day low</p>
              <p className="tabular font-display text-lg font-semibold">$2.75</p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-xs">
              <p className="text-muted-foreground">Pattern</p>
              <p className="tabular font-display text-lg font-semibold">14 d</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
