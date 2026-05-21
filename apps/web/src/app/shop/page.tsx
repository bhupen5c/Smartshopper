'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowRight, TrendingDown, ShoppingCart, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div
      className="mx-auto max-w-2xl px-6 pt-14"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="mb-10 text-center">
        <div className="mb-5 inline-flex items-center gap-2 ss-chip ss-chip--lime">
          <ShoppingCart className="size-3" />
          Free to use · no signup
        </div>
        <h1 className="bignum text-[clamp(48px,8vw,80px)] leading-[0.95]">
          FIND THE
          <br />
          <span className="mark-lime">CHEAPEST</span> SHOP
        </h1>
        <p className="mt-5 text-base text-ink/70">
          Enter your postcode. We&apos;ll find real nearby stores and compare delivery vs pickup
          costs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="postcode" className="mb-2 block font-mono text-xs uppercase tracking-[0.12em] text-ink/70">
            <MapPin className="mr-1 inline size-3.5" />
            Your postcode
          </label>
          <div className="flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-paper p-2 pl-6 shadow-brut">
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
              className="flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-ink/30"
              autoFocus
            />
            <button type="submit" className="btn-ink" style={{ padding: '10px 22px', fontSize: 13 }}>
              Go <ArrowRight className="size-4" />
            </button>
          </div>
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="error"
                className="mt-2 text-sm font-medium"
                style={{ color: 'var(--tomato)' }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
            {suburb && !error && (
              <motion.p
                key="suburb"
                className="mt-2 text-sm font-medium text-ink/70"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <MapPin className="mr-1 inline size-3" />
                {suburb}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </form>

      <div className="mt-14 grid grid-cols-3 gap-4 border-t-[1.5px] border-ink pt-8">
        {[
          { icon: TrendingDown, n: '01', label: 'Real specials', sub: 'Not cosmetic discounts' },
          { icon: ShoppingCart, n: '02', label: 'Major supermarkets', sub: 'Coles, Woolies, ALDI & IGA' },
          { icon: Truck, n: '03', label: 'Real distance', sub: 'OpenStreetMap data' },
        ].map(({ icon: Icon, n, label, sub }, i) => (
          <motion.div
            key={label}
            className="text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
          >
            <div className="font-mono text-xs" style={{ color: 'var(--tomato)' }}>
              / {n}
            </div>
            <Icon className="mx-auto mt-2 size-6 text-ink" />
            <div className="mt-2 text-sm font-semibold">{label}</div>
            <div className="mt-1 text-xs text-ink/60">{sub}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
