'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { motion } from 'framer-motion';

// Representative catalogue prices — a sample strip, not a live feed.
const TICKER_ITEMS: Array<{ name: string; price: string; retailer: string }> = [
  { name: 'TIM TAM 200G', price: '$2.75', retailer: 'COLES' },
  { name: 'MILK 2L', price: '$3.19', retailer: 'ALDI' },
  { name: 'WEET-BIX 1.2KG', price: '$5.20', retailer: 'COLES' },
  { name: 'CHICKEN BREAST 1KG', price: '$11.00', retailer: 'WOOLIES' },
  { name: 'TASTY CHEESE 500G', price: '$8.50', retailer: 'WOOLIES' },
  { name: 'OLIVE OIL 750ML', price: '$10.00', retailer: 'WOOLIES' },
  { name: 'NESCAFE 500G', price: '$18.00', retailer: 'WOOLIES' },
  { name: 'COKE 2L', price: '$2.85', retailer: 'COLES' },
  { name: 'BREAD 700G', price: '$3.80', retailer: 'COLES' },
  { name: 'EGGS 12PK', price: '$4.89', retailer: 'ALDI' },
];

const LIVE_COMPARISON = [
  { s: 'CO', name: 'Coles', price: '$2.75', delta: '-50%', best: true },
  { s: 'WW', name: 'Woolworths', price: '$3.65', delta: '-34%' },
  { s: 'AL', name: 'ALDI', price: '$3.49', delta: '-37%' },
  { s: 'IG', name: 'IGA', price: '$5.50', delta: '—' },
];

const VALUE_PROPS: Array<[string, string, string]> = [
  ['01', 'Search the catalogue', 'Brand names or generic queries like "haloumi" or "shampoo".'],
  ['02', 'Build a list', 'Adjust quantities, mark generics, save loyalty memberships.'],
  ['03', 'Compare across retailers', 'Optimiser picks the cheapest basket within your travel budget.'],
  ['04', 'See real store details', 'Name, address, hours and distance from OpenStreetMap.'],
];

export function Hero() {
  return (
    <section className="border-b border-ink ss-grain">
      {/* Ticker bar */}
      <div className="ticker">
        <div className="ticker__track">
          {[...Array(2)].map((_, i) => (
            <Fragment key={i}>
              {TICKER_ITEMS.map((item, j) => (
                <Fragment key={`${i}-${j}`}>
                  <span className="ticker__item">
                    {item.name} {item.price} {item.retailer}
                  </span>
                  <span>·</span>
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="container grid gap-12 px-6 py-14 md:grid-cols-[1.25fr_1fr] md:px-10 md:py-16">
        {/* LEFT — bold headline */}
        <div className="relative">
          <motion.div
            className="mb-7 flex flex-wrap gap-2.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="ss-chip ss-chip--lime">Open preview</span>
            <span className="ss-chip">Real OSM store data</span>
          </motion.div>

          <motion.h1
            className="bignum text-[clamp(72px,12vw,158px)] text-ink"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            STOP
            <br />
            <span style={{ color: 'var(--tomato)' }}>OVER</span>—
            <br />
            PAYING.
          </motion.h1>

          <motion.p
            className="mt-8 max-w-[520px] text-lg text-ink/70"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            SmartShopper compares grocery prices at{' '}
            <span className="mark-lime"><b>Coles, Woolworths, ALDI &amp; IGA</b></span> and uses
            real OpenStreetMap data for nearby stores. One list. Real distances. No fake specials.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/shop" className="btn-lime">
              Compare a basket →
            </Link>
            <Link href="/shop/list" className="btn-outline">
              Build a list
            </Link>
          </motion.div>

          {/* Honest "what's here today" strip — no fake reviews. */}
          <motion.div
            className="mt-9 flex items-center gap-3.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex">
              {['#FF4D2E', '#DCFF3D', '#2A3CFF', '#0F0F0E', '#F7F2E7'].map((c, i) => (
                <span
                  key={i}
                  className="inline-block size-8 rounded-full border-[1.5px] border-ink"
                  style={{ background: c, marginLeft: i === 0 ? 0 : -10 }}
                />
              ))}
            </div>
            <div className="text-sm leading-tight">
              <div className="font-semibold">Open preview · no reviews yet</div>
              <div className="text-ink/70">Public catalogues only · no member-pricing claims.</div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — live comparison card */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="tape" style={{ top: -14, right: 60 }} />
          <div
            className="brut-card brut-card--lg p-6"
            style={{ transform: 'rotate(1.5deg)' }}
          >
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-ink/70">
                  Example comparison
                </div>
                <div className="bignum mt-1.5 text-[28px]">Tim Tam Original 200g</div>
              </div>
              <span className="ss-chip ss-chip--tomato">demo</span>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {LIVE_COMPARISON.map((r) => (
                <div
                  key={r.name}
                  className="grid grid-cols-[1.4fr_1fr_1fr] items-center rounded-xl px-3.5 py-3"
                  style={{
                    background: r.best ? 'var(--lime)' : 'transparent',
                    border: r.best ? '1.5px solid var(--ink)' : '1px dashed var(--ink-15)',
                  }}
                >
                  <div className="store">
                    <span className={`store__bug ${r.best ? 'store__bug--best' : ''}`}>
                      {r.s}
                    </span>
                    {r.name}
                    {r.best && (
                      <span className="ml-1 rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-bold tracking-[0.1em] text-lime">
                        BEST
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-lg font-semibold">{r.price}</div>
                  <div
                    className="text-right font-mono text-[13px] font-semibold"
                    style={{ color: r.delta === '—' ? 'var(--ink-40)' : 'var(--ink)' }}
                  >
                    {r.delta}
                  </div>
                </div>
              ))}
            </div>

            <div className="dot-rule my-4" />
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-ink/70">YOU SAVE</div>
              <div className="bignum text-[32px]" style={{ color: 'var(--tomato)' }}>
                –$2.75
              </div>
            </div>
          </div>

          {/* Satellite badge */}
          <div
            className="absolute -bottom-5 -left-7 rounded-full border-[1.5px] border-ink bg-cobalt px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-cream shadow-brut"
            style={{ transform: 'rotate(-6deg)' }}
          >
            ★ Real store data · OpenStreetMap
          </div>
        </motion.div>
      </div>

      {/* Bottom strip — value props */}
      <div className="grid border-t border-ink bg-cream md:grid-cols-4">
        {VALUE_PROPS.map(([n, t, d], i) => (
          <div
            key={n}
            className="px-7 py-6"
            style={{
              borderRight: i < 3 ? '1.5px solid var(--ink)' : 'none',
            }}
          >
            <div className="font-mono text-xs" style={{ color: 'var(--tomato)' }}>
              / {n}
            </div>
            <div className="bignum mt-2 text-[22px]">{t}</div>
            <div className="mt-1.5 text-[13px] leading-relaxed text-ink/70">{d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
