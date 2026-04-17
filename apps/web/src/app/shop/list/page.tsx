'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Minus, X, Zap, MapPin, Settings2, ChevronDown, ChevronUp, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '@/lib/shop-context';
import { CATALOGUE_PRODUCTS } from '@/lib/catalogue';
import { fuzzyMatch } from '@/lib/fuzzy-match';
import { matchIntent, findProductsByKeywords, type IntentMatch, type ProbeOption } from '@/lib/smart-search';

export default function ShopListPage() {
  const {
    items, addItem, removeItem, updateQuantity,
    postcode, suburb, origin,
    preferences, setPreferences,
    hydrated,
  } = useShop();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  // Smart search state
  const [activeProbe, setActiveProbe] = useState<IntentMatch | null>(null);
  const [probeProducts, setProbeProducts] = useState<typeof CATALOGUE_PRODUCTS>([]);

  if (!hydrated) return null;

  if (!origin) {
    router.push('/shop');
    return null;
  }

  // Determine what to show in dropdown
  const productMatches = query.length >= 2
    ? fuzzyMatch(query, CATALOGUE_PRODUCTS, 6)
    : [];
  const intentMatch = query.length >= 3 && productMatches.length <= 1
    ? matchIntent(query)
    : null;

  function handleAddProduct(product: (typeof CATALOGUE_PRODUCTS)[0]) {
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      updateQuantity(existing.id, existing.quantity + 1);
    } else {
      addItem({ query: product.name, productId: product.id, productName: product.name, quantity: 1 });
    }
    setQuery('');
    setShowSuggestions(false);
    setActiveProbe(null);
    setProbeProducts([]);
  }

  function handleProbeOption(option: ProbeOption) {
    const products = findProductsByKeywords(option.productKeywords);
    if (products.length === 1) {
      // Only one match → add directly
      handleAddProduct(products[0]!);
    } else if (products.length > 0) {
      // Multiple matches → show them
      setProbeProducts(products);
    } else {
      // No matches in catalogue → add as free text
      addItem({ query: `${option.label}`, productId: null, productName: null, quantity: 1 });
      setQuery('');
      setShowSuggestions(false);
      setActiveProbe(null);
    }
  }

  function handleAddFreeText() {
    if (!query.trim()) return;
    addItem({ query: query.trim(), productId: null, productName: null, quantity: 1 });
    setQuery('');
    setShowSuggestions(false);
    setActiveProbe(null);
    setProbeProducts([]);
  }

  function resetSearch() {
    setQuery('');
    setShowSuggestions(false);
    setActiveProbe(null);
    setProbeProducts([]);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Shopping List</h1>
        <p className="text-sm text-gray-500 mt-1">
          <MapPin className="h-3 w-3 inline mr-1" />
          {suburb} ({postcode})
        </p>
      </div>

      {/* Search / Add bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setActiveProbe(null);
              setProbeProducts([]);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="What do you need? (e.g. Tim Tam, hair products, dinner ideas)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Smart Search Dropdown */}
        {showSuggestions && query.length >= 2 && !activeProbe && probeProducts.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
            {/* Intent-based probe (vague query like "hair products") */}
            {intentMatch && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2.5 bg-emerald-50 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">{intentMatch.category.question}</span>
                </div>
                <div className="p-2 grid grid-cols-2 gap-1.5">
                  {intentMatch.category.options.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setActiveProbe(intentMatch);
                        handleProbeOption(opt);
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors"
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                      <ArrowRight className="h-3 w-3 text-gray-300 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Direct product matches */}
            {productMatches.length > 0 && (
              <>
                {intentMatch && (
                  <div className="px-4 py-1.5 text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                    Or add a specific product
                  </div>
                )}
                {productMatches.map(({ item }) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddProduct(item)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.brand} · {item.size} · {item.category}</div>
                    </div>
                    <Plus className="h-4 w-4 text-emerald-500 shrink-0" />
                  </button>
                ))}
              </>
            )}

            {/* Fallback: add as free text */}
            {!intentMatch && productMatches.length === 0 && (
              <button
                onClick={handleAddFreeText}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">Add &ldquo;{query}&rdquo;</div>
                  <div className="text-xs text-gray-400">Not in catalogue — will be listed but not optimised</div>
                </div>
                <Plus className="h-4 w-4 text-gray-400 shrink-0" />
              </button>
            )}
          </div>
        )}

        {/* Probe results: products matching the subcategory */}
        {probeProducts.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
            <div className="px-4 py-2.5 bg-emerald-50 flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-800">Pick a product</span>
              <button onClick={resetSearch} className="text-xs text-emerald-600 hover:underline">
                Back
              </button>
            </div>
            {probeProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleAddProduct(product)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-400">{product.brand} · {product.size} · {product.category}</div>
                </div>
                <Plus className="h-4 w-4 text-emerald-500 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Item list */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Search className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Search for products or try broad terms like</p>
          <p className="text-sm font-medium text-gray-500 mt-1">
            &ldquo;hair products&rdquo; &middot; &ldquo;dinner ideas&rdquo; &middot; &ldquo;cleaning&rdquo; &middot; &ldquo;baby&rdquo;
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              className="flex items-center justify-between px-4 py-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {item.productName ?? item.query}
                </div>
                {!item.productId && (
                  <div className="text-xs text-amber-500">Not in catalogue</div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-gray-200">
        <button
          onClick={() => setShowPrefs(!showPrefs)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700"
        >
          <span className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Shopping Preferences
          </span>
          {showPrefs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showPrefs && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max stores to visit</label>
                <select
                  value={preferences.maxStores}
                  onChange={(e) => setPreferences({ maxStores: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={1}>1 store</option>
                  <option value={2}>2 stores</option>
                  <option value={3}>3 stores</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max travel distance</label>
                <select
                  value={preferences.maxTravelKm}
                  onChange={(e) => setPreferences({ maxTravelKm: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={15}>15 km</option>
                  <option value={25}>25 km</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">Loyalty memberships</label>
              <div className="flex flex-wrap gap-2">
                {['flybuys', 'everyday_rewards'].map((code) => {
                  const label = code === 'flybuys' ? 'Flybuys (Coles)' : 'Everyday Rewards (Woolies)';
                  const active = preferences.loyaltyMemberships.includes(code);
                  return (
                    <button
                      key={code}
                      onClick={() => {
                        const next = active
                          ? preferences.loyaltyMemberships.filter((c) => c !== code)
                          : [...preferences.loyaltyMemberships, code];
                        setPreferences({ loyaltyMemberships: next });
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={preferences.noCarAvailable}
                onChange={(e) => setPreferences({ noCarAvailable: e.target.checked })}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              I don&apos;t have a car (delivery only)
            </label>
          </div>
        )}
      </div>

      {/* CTA */}
      {items.filter((i) => i.productId).length > 0 && (
        <button
          onClick={() => router.push('/shop/results')}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Find Best Deals ({items.filter((i) => i.productId).length} items)
        </button>
      )}
    </div>
  );
}
