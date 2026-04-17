'use client';

import { useState } from 'react';
import { Loader2, MailCheck } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/motion';

export function Waitlist() {
  const [email, setEmail] = useState('');
  const [postcode, setPostcode] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'done'>('idle');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setState('submitting');
    // Simulate submission — real endpoint comes with the api app.
    await new Promise((r) => setTimeout(r, 700));
    setState('done');
  }

  return (
    <section id="waitlist" className="container py-16 md:py-24">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">
          Be the first to know when we launch
        </h2>
        <p className="mt-3 text-muted-foreground">
          Early members get the mobile app the day it drops, and their postcode shapes which stores
          we onboard next.
        </p>
        <form
          className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row"
          onSubmit={onSubmit}
        >
          <label className="sr-only" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-1"
          />
          <label className="sr-only" htmlFor="postcode">
            Postcode
          </label>
          <input
            id="postcode"
            name="postcode"
            required
            inputMode="numeric"
            pattern="\d{4}"
            placeholder="Postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="flex h-11 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm tabular ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="lg" disabled={state !== 'idle'}>
            {state === 'submitting' ? <Loader2 className="size-4 animate-spin" /> : null}
            {state === 'done' ? <MailCheck className="size-4" /> : null}
            {state === 'done' ? "You're in" : state === 'submitting' ? 'Joining…' : 'Join waitlist'}
          </Button>
        </form>
        {state === 'done' && (
          <p className="mt-3 text-sm text-primary">
            Thanks — we&apos;ll be in touch. Your postcode will guide which stores we onboard first.
          </p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          We only store your email and postcode. No spam; unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
