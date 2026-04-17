import { ArrowDownRight, ArrowRight, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PriceSparkline } from '@/components/price-sparkline';
import { formatAUD, formatPercent } from '@/lib/utils';
import type { DemoProduct } from '@/lib/demo-data';

export function ProductCard({ product }: { product: DemoProduct }) {
  const trendIcon =
    product.percentileRank90d <= 0.2 ? (
      <ArrowDownRight className="size-3.5" aria-hidden />
    ) : product.percentileRank90d >= 0.8 ? (
      <ArrowUpRight className="size-3.5" aria-hidden />
    ) : (
      <ArrowRight className="size-3.5" aria-hidden />
    );

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {product.retailer}
            </span>
            <h3 className="font-display text-base font-semibold leading-tight">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.size}</p>
          </div>
          <PriceSparkline prices={product.history} />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="tabular font-display text-2xl font-semibold leading-none">
              {formatAUD(product.currentPrice)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              {trendIcon}
              <span>
                {formatPercent(1 - product.percentileRank90d)} cheaper than typical 90-day price
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {product.isTrueSpecial ? (
              <Badge variant="savings" className="gap-1">
                <Sparkles className="size-3" aria-hidden />
                True special
              </Badge>
            ) : (
              <Badge variant="cosmetic" className="gap-1">
                Cosmetic discount
              </Badge>
            )}
            {product.memberOnly && (
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="size-3" aria-hidden />
                Members only
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
          <span>
            Baseline {formatAUD(product.baseline)} · Low 90d {formatAUD(product.low90d)}
          </span>
          <span className="tabular">
            {product.cycleDays > 0 ? `Cycle ${product.cycleDays}d` : 'No cycle'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
