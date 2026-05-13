'use client';

import Link from 'next/link';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useShop } from '@/lib/shop-context';

export function ConsumerHeader() {
  const { items } = useShop();

  return (
    <header className="ss-nav sticky top-0">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to home"
          className="text-ink/50 transition-opacity hover:opacity-100"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <Link href="/shop" className="ss-nav__logo">
          <span className="dot" />
          <span>
            SMARTSHOPPER<span style={{ color: 'var(--tomato)' }}>.</span>
          </span>
        </Link>
      </div>

      <Link
        href="/shop/list"
        className="ss-nav__cta"
        style={{
          background: items.length > 0 ? 'var(--lime)' : 'var(--ink)',
          color: items.length > 0 ? 'var(--ink)' : 'var(--cream)',
          borderRadius: 100,
          border: '1.5px solid var(--ink)',
        }}
      >
        <ShoppingCart className="size-4" />
        {items.length > 0 ? (
          <span>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        ) : (
          <span>List</span>
        )}
      </Link>
    </header>
  );
}
