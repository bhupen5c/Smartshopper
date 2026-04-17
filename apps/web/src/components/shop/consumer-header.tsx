'use client';

import Link from 'next/link';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useShop } from '@/lib/shop-context';

export function ConsumerHeader() {
  const { items } = useShop();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/shop" className="text-lg font-bold text-emerald-600">
            SmartShopper
          </Link>
        </div>
        <Link
          href="/shop/list"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          {items.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
