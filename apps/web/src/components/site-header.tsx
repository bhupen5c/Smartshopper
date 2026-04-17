'use client';

import Link from 'next/link';
import { ShoppingBasket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className={`sticky top-0 z-30 border-b transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-sm'
          : 'bg-background/40 backdrop-blur-sm'
      }`}
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <motion.span
            className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <ShoppingBasket className="size-4" aria-hidden />
          </motion.span>
          <span className="tracking-tight">SmartShopper</span>
          <Badge variant="muted" className="hidden sm:inline-flex">
            AU preview
          </Badge>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {[
            { href: '#specials', label: 'Specials' },
            { href: '#pattern', label: 'Pattern analysis' },
            { href: '#basket', label: 'Basket plans' },
            { href: '#delivery', label: 'Delivery vs pickup' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative text-muted-foreground transition-colors hover:text-foreground group"
            >
              {label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button size="sm" asChild className="shadow-glow hover:shadow-glow-lg transition-shadow duration-300">
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
