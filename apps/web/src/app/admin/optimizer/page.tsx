'use client';

import { useState } from 'react';
import { ShoppingCart, Truck, MapPin, Plus, X, Zap } from 'lucide-react';
import { DEMO_PRODUCTS, DEMO_DELIVERY } from '@/lib/demo-data';
import { formatAUD } from '@/lib/utils';

interface BasketItem {
  productId: string;
  name: string;
  qty: number;
}

export default function OptimizerPage() {
  const [basket, setBasket] = useState<BasketItem[]>([
    { productId: 'p1', name: "Arnott's Tim Tam Original", qty: 2 },
    { productId: 'p2', name: 'Cadbury Dairy Milk Block', qty: 1 },
    { productId: 'p5', name: 'Weet-Bix Original', qty: 1 },
    { productId: 'p6', name: 'Tip Top Bread', qty: 3 },
  ]);
  const [optimized, setOptimized] = useState(false);
  const [suburb, setSuburb] = useState('Bondi, NSW 2026');

  function removeItem(idx: number) {
    setBasket((prev) => prev.filter((_, i) => i !== idx));
  }

  function runOptimizer() {
    setOptimized(true);
  }

  const basketTotal = basket.reduce((sum, item) => {
    const product = DEMO_PRODUCTS.find((p) => p.id === item.productId);
    return sum + (product?.currentPrice ?? 0) * item.qty;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Basket Optimizer</h1>
        <p className="text-sm text-gray-500 mt-1">
          Test the shopping list optimizer and delivery vs pickup recommender
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shopping List */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Shopping List
            </h2>
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
              <Plus className="h-3 w-3" />
              Add Item
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {basket.map((item, i) => {
              const product = DEMO_PRODUCTS.find((p) => p.id === item.productId);
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    <span className="text-xs text-gray-400">x{item.qty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-600">
                      {product ? formatAUD(product.currentPrice * item.qty) : '—'}
                    </span>
                    <button
                      onClick={() => removeItem(i)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-500">Estimated Total</span>
            <span className="text-lg font-bold text-gray-900">{formatAUD(basketTotal)}</span>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              <MapPin className="h-3 w-3 inline mr-1" />
              Delivery Address
            </label>
            <input
              type="text"
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <button
            onClick={runOptimizer}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Zap className="h-4 w-4" />
            Optimize Basket
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {optimized ? (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery vs Pickup Analysis
                </h2>
                <div className="space-y-3">
                  {DEMO_DELIVERY.map((d, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${
                        d.isBest
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{d.retailer}</span>
                          <span className="text-xs text-gray-400">{d.mode}</span>
                          {d.isBest && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              Best Option
                            </span>
                          )}
                        </div>
                        <span className="text-lg font-bold text-gray-900">{formatAUD(d.total)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-2">
                        <div>Fee: {formatAUD(d.fee)}</div>
                        <div>Distance: {d.distanceKm}km</div>
                        <div>Drive: {d.driveMinutes}min</div>
                        <div>Loyalty: -{formatAUD(d.loyaltyRebate)}</div>
                      </div>
                      <p className="text-xs text-gray-500">{d.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Split-Store Strategy</h2>
                <p className="text-sm text-gray-600">
                  Buying Tim Tams + Weet-Bix at <span className="font-medium">Coles</span> (half price specials)
                  and bread at <span className="font-medium">Woolworths</span> saves{' '}
                  <span className="font-bold text-emerald-600">$4.80</span> vs single-store shopping.
                  With Coles Direct to Boot (free), the split-store trip adds only 8 minutes.
                </p>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400">Add items and click Optimize</h3>
              <p className="text-sm text-gray-400 mt-1">
                The optimizer will find the cheapest combination of stores and delivery/pickup options
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
