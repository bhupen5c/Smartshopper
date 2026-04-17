import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAUD(value: number, opts: { decimals?: number } = {}): string {
  const decimals = opts.decimals ?? 2;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function relativeDaysFromNow(iso: string | null): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  const diff = then - Date.now();
  const days = Math.round(diff / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days > 0) return `in ${days}d`;
  return `${Math.abs(days)}d ago`;
}
