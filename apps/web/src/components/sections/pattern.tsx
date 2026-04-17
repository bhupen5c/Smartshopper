'use client';

import { Activity, CalendarClock, LineChart, Radar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/motion';

const features = [
  {
    icon: LineChart,
    title: 'Trimmed-mean baseline',
    body: 'We calculate the "normal" price by dropping the cheapest 20% (promotional days) and most expensive 5% (outliers). Far more truthful than a retailer\'s was-price.',
  },
  {
    icon: CalendarClock,
    title: 'Cycle detection',
    body: 'Autocorrelation on 180 days of daily lows. Surfaces the 4, 6, 8-week promo cadences Coles and Woolies run — and predicts the next drop.',
  },
  {
    icon: Radar,
    title: 'True-special classifier',
    body: 'Tags every promotion as genuinely cheap or cosmetic: the price must be in the lowest 20% of the window and at-or-below the previous cycle\'s low.',
  },
  {
    icon: Activity,
    title: 'Percentile rank',
    body: 'How cheap is "now" compared to the last 30, 90 and 365 days? A single badge tells you if this is the best price of the year.',
  },
];

export function Pattern() {
  return (
    <section id="pattern" className="border-y bg-muted/40">
      <div className="container py-16 md:py-24">
        <FadeIn>
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">How we tell a real special from a fake one</h2>
            <p className="mt-3 text-muted-foreground">
              Retailers design catalogues to make every deal look like the deal of the week. The
              pattern analyser looks at the full price history and strips away the theatre.
            </p>
          </div>
        </FadeIn>
        <StaggerChildren className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="mt-3 text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
