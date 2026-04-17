import { ProductCard } from '@/components/product-card';
import { DEMO_PRODUCTS } from '@/lib/demo-data';

export function Specials() {
  return (
    <section id="specials" className="container py-16 md:py-24">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">This week&apos;s live feed</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            A sample of the catalogue we monitor. Every card shows the 30-day sparkline, the 90-day
            trimmed baseline, and a verdict on whether this week&apos;s special is genuinely cheap
            or merely dressed up as one.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Demo data · real scrapers coming online at M1
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
