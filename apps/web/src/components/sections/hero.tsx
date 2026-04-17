'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, ShoppingCart, TrendingDown, Truck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/ui/motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-200/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* Floating icons */}
      <div aria-hidden className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-[15%] text-emerald-300/40"
          animate={{ y: [-8, 8, -8], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ShoppingCart className="h-10 w-10" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-[8%] text-cyan-300/30"
          animate={{ y: [6, -10, 6], rotate: [0, -3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <TrendingDown className="h-8 w-8" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-[20%] text-emerald-200/30"
          animate={{ y: [-6, 12, -6] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          <Truck className="h-9 w-9" />
        </motion.div>
      </div>

      <div className="container grid gap-10 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Badge variant="secondary" className="w-fit gap-1">
              <Sparkles className="size-3.5" aria-hidden />
              Built for Australian shoppers
            </Badge>
          </motion.div>

          <motion.h1
            className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            Spot the{' '}
            <motion.span
              className="text-primary inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              real
            </motion.span>{' '}
            specials.{' '}
            <span className="text-muted-foreground/60">Skip the fake ones.</span>
          </motion.h1>

          <motion.p
            className="max-w-xl text-base text-muted-foreground md:text-lg"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            SmartShopper tracks every price at Coles, Woolworths, ALDI and IGA over time, flags
            genuinely low prices, forecasts the next cycle drop, optimises your basket across
            retailers, and tells you whether delivery or click-and-collect actually saves you money.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" asChild className="shadow-glow hover:shadow-glow-lg transition-shadow duration-300">
                <Link href="/shop">
                  <Zap className="size-4 mr-1" aria-hidden />
                  Start Shopping
                  <ArrowRight className="size-4 ml-1" aria-hidden />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button variant="outline" size="lg" asChild>
                <Link href="#specials">See live specials</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Animated stats */}
          <motion.dl
            className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 md:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {[
              { label: 'Retailers tracked', value: 4, suffix: '', sub: 'Coles · Woolies · ALDI · IGA' },
              { label: 'Products under watch', value: 45200, suffix: '+', sub: 'Updated nightly' },
              { label: 'True-special accuracy', value: 91, suffix: '%', sub: 'Validated against 180-day lows' },
              { label: 'Avg. basket savings', value: 18, suffix: '%', sub: 'Per week vs single-store shop' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</dt>
                <dd className="tabular font-display text-2xl font-semibold leading-none">
                  <AnimatedCounter value={s.value} suffix={s.suffix} duration={1.8} />
                </dd>
                <dd className="mt-1 text-xs text-muted-foreground">{s.sub}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Demo card — animated entrance */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 40, rotateY: 5 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div
            aria-hidden
            className="absolute -left-6 -top-6 size-40 rounded-full bg-primary/20 blur-3xl animate-pulse-soft"
          />
          <motion.div
            className="relative rounded-2xl border bg-card/60 p-4 shadow-lg backdrop-blur-sm"
            whileHover={{ y: -4, boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.15)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Tim Tam Original 200 g
              </span>
              <Badge variant="savings">True special</Badge>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <span className="tabular font-display text-4xl font-semibold">$2.75</span>
              <span className="text-sm text-muted-foreground line-through">$5.50</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Cheapest price in 180 days. Next drop predicted in 14 days based on Coles&apos;s
              fortnightly pattern.
            </p>
            {/* Animated sparkline */}
            <svg viewBox="0 0 200 60" className="mt-4 h-16 w-full">
              <motion.path
                d="M0,45 Q20,44 40,40 Q60,38 80,20 Q100,10 120,40 Q140,46 160,12 Q180,6 200,35"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.8, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>

          <motion.div
            className="mt-4 grid grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            {[
              { label: 'Baseline', value: '$5.25' },
              { label: '180-day low', value: '$2.75' },
              { label: 'Pattern', value: '14 d' },
            ].map((item) => (
              <motion.div
                key={item.label}
                className="rounded-xl border bg-card p-3 text-xs"
                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <p className="text-muted-foreground">{item.label}</p>
                <p className="tabular font-display text-lg font-semibold">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
