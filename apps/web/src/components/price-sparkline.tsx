/**
 * Tiny inline sparkline for product price history.
 * Renders a path using SVG with no external chart library — keeps the card render fast.
 */
import { cn } from '@/lib/utils';

export function PriceSparkline({
  prices,
  className,
  width = 120,
  height = 32,
  strokeWidth = 1.5,
}: {
  prices: readonly number[];
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}) {
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices.map((p, i) => {
    const x = (i / Math.max(1, prices.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const d = `M ${points.join(' L ')}`;

  const latest = prices[prices.length - 1]!;
  const previous = prices.length > 1 ? prices[prices.length - 2]! : latest;
  const trendColour = latest < previous ? 'stroke-savings' : latest > previous ? 'stroke-cosmetic' : 'stroke-muted-foreground';

  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      className={cn('text-primary', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path d={d} fill="none" className={trendColour} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
