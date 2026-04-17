'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowRight, ShoppingCart, TrendingDown, Truck } from 'lucide-react';
import { useShop } from '@/lib/shop-context';
import { lookupPostcode } from '@/lib/postcodes';

export default function ShopPage() {
  const { postcode, suburb, setPostcode, hydrated } = useShop();
  const [input, setInput] = useState(postcode);
  const [error, setError] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    const entry = lookupPostcode(trimmed);
    if (!entry) {
      setError('Postcode not found. Try a major metro area (e.g. 2000, 3000, 4000).');
      return;
    }
    setPostcode(trimmed);
    setError('');
    router.push('/shop/list');
  }

  if (!hydrated) return null;

  return (
    <div className="max-w-lg mx-auto pt-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full mb-4">
          <ShoppingCart className="h-3 w-3" />
          Free to use — no signup required
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Find the cheapest way to shop
        </h1>
        <p className="text-gray-500">
          Enter your postcode so we can find nearby stores and compare delivery vs pickup costs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="h-3.5 w-3.5 inline mr-1" />
            Your postcode
          </label>
          <div className="flex gap-2">
            <input
              id="postcode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError('');
              }}
              placeholder="e.g. 2026"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              Go
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          {suburb && !error && (
            <p className="text-sm text-emerald-600 mt-1">
              <MapPin className="h-3 w-3 inline mr-1" />
              {suburb}
            </p>
          )}
        </div>
      </form>

      <div className="mt-12 grid grid-cols-3 gap-4 text-center">
        {[
          { icon: TrendingDown, label: 'Find real specials', sub: 'Not cosmetic discounts' },
          { icon: ShoppingCart, label: 'Optimise your basket', sub: 'Across Coles, Woolies, ALDI, IGA' },
          { icon: Truck, label: 'Delivery or pickup?', sub: 'Based on your actual cost' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="p-4">
            <Icon className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
