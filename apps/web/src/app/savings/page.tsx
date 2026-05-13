import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Savings dashboard',
  description:
    'Year-to-date savings recap — receipt, monthly bar chart, top-saved categories and deals dropping this week.',
};

// Sample data — in production this comes from the user's purchase history.
const MONTHS = [
  { m: 'JAN', v: 64, dollars: 98 },
  { m: 'FEB', v: 71, dollars: 112 },
  { m: 'MAR', v: 58, dollars: 84 },
  { m: 'APR', v: 89, dollars: 142 },
  { m: 'MAY', v: 76, dollars: 121, current: true },
  { m: 'JUN', v: 92, dollars: 158 },
  { m: 'JUL', v: 84, dollars: 134 },
  { m: 'AUG', v: 67, dollars: 102 },
  { m: 'SEP', v: 78, dollars: 118 },
  { m: 'OCT', v: 95, dollars: 168 },
  { m: 'NOV', v: 88, dollars: 144 },
  { m: 'DEC', v: 42, dollars: 66 },
];

const CATEGORIES = [
  { c: 'Dairy & Eggs', $: 284, pct: 92 },
  { c: 'Produce', $: 241, pct: 78 },
  { c: 'Pantry', $: 198, pct: 64 },
  { c: 'Meat & Seafood', $: 176, pct: 57 },
  { c: 'Snacks', $: 142, pct: 46 },
  { c: 'Household', $: 88, pct: 28 },
];

const NEXT_DEALS = [
  { t: 'Greek yogurt 907g', store: 'WOOLWORTHS', was: '8.00', now: '7.50', d: 'Tue' },
  { t: 'Avocados ea.', store: 'WOOLWORTHS', was: '2.50', now: '2.00', d: 'Wed' },
  { t: 'Olive oil 750ml', store: 'WOOLWORTHS', was: '12.00', now: '10.00', d: 'Fri' },
  { t: 'Tim Tam Original 200g', store: 'COLES', was: '5.50', now: '2.75', d: 'Sat' },
];

const RECEIPT_ROWS: Array<[string, string]> = [
  ['Cheapest store hit', 'ALDI · 84×'],
  ['Biggest single save', '$42.18'],
  ['Most-tracked item', 'Pauls Milk'],
  ['Loyalty rebates stacked', '118'],
  ['Avg trip savings', '$4.57'],
  ['Hrs not in spreadsheets', '27h'],
];

export default function SavingsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO STRIP */}
        <div className="border-b-[1.5px] border-ink ss-grain">
          <div className="container grid gap-10 px-6 py-12 md:grid-cols-[1.3fr_1fr] md:px-10 md:py-14">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.16em] text-ink/70">
                ◉ YEAR–TO–DATE · 2026
              </div>
              <h1 className="bignum mt-2 text-[clamp(80px,14vw,132px)] leading-[0.9]">
                <span className="text-ink/40">$</span>1,447
                <span style={{ color: 'var(--tomato)' }}>.</span>
                <span style={{ fontSize: '0.55em' }}>82</span>
              </h1>
              <div className="mt-1.5 text-xl text-ink/70">
                saved across <b className="text-ink">317 trips</b> · 38 stores compared
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <span className="ss-chip ss-chip--lime">↑ 24% vs last year</span>
                <span className="ss-chip">Streak · 11 wks</span>
                <span className="ss-chip ss-chip--tomato">Top 3% saver</span>
              </div>
            </div>

            {/* Receipt */}
            <div className="receipt" style={{ transform: 'rotate(-1deg)' }}>
              <div
                className="px-4 py-3.5 text-center"
                style={{ borderBottom: '1.5px dashed var(--ink)' }}
              >
                <div className="font-display text-lg tracking-wide">SMARTSHOPPER</div>
                <div className="text-[10px] tracking-[0.1em] text-ink/70">
                  ◤ ANNUAL RECAP · MAY 13 ◥
                </div>
              </div>
              {RECEIPT_ROWS.map(([label, value]) => (
                <div key={label} className="receipt__row">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              <div
                className="flex items-center justify-between px-4 py-3.5 font-mono text-sm font-bold"
                style={{ background: 'var(--ink)', color: 'var(--lime)' }}
              >
                <span>TOTAL SAVED</span>
                <span>$1,447.82</span>
              </div>
              <div className="px-4 py-2.5 text-center font-mono text-[10px] tracking-[0.1em] text-ink/60">
                ◤◤◤ THANK YOU FOR SHOPPING SMART ◥◥◥
              </div>
            </div>
          </div>
        </div>

        {/* CHART STRIP */}
        <div className="border-b-[1.5px] border-ink px-6 py-10 md:px-10">
          <div className="container">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.14em] text-ink/70">
                  MONTHLY SAVINGS · 2026
                </div>
                <div className="bignum mt-1 text-[clamp(28px,4vw,36px)]">
                  Best month: <span className="mark-lime">October</span>,{' '}
                  <span className="font-mono text-[0.78em]">$168</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="ss-chip">Weekly</span>
                <span className="ss-chip ss-chip--ink">Monthly</span>
                <span className="ss-chip">Yearly</span>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-12 items-end gap-2.5" style={{ height: 200 }}>
              {MONTHS.map((m) => {
                const high = m.v > 90;
                const bg = high ? 'var(--tomato)' : m.current ? 'var(--cobalt)' : 'var(--lime)';
                return (
                  <div key={m.m} className="flex flex-col items-center gap-2">
                    <div
                      className="font-mono text-[11px] font-bold"
                      style={{ color: high ? 'var(--tomato)' : 'var(--ink-70)' }}
                    >
                      ${m.dollars}
                    </div>
                    <div
                      className="w-full"
                      style={{
                        height: `${m.v}%`,
                        background: bg,
                        border: '1.5px solid var(--ink)',
                        borderBottom: 'none',
                        borderRadius: '6px 6px 0 0',
                      }}
                    />
                    <div
                      className="font-mono text-[11px] tracking-wide"
                      style={{
                        color: m.current ? 'var(--cobalt)' : 'var(--ink-70)',
                        fontWeight: m.current ? 700 : 400,
                      }}
                    >
                      {m.m}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* TWO COLUMN LIST */}
        <div className="grid border-b-[1.5px] border-ink md:grid-cols-2">
          {/* Top savers leaderboard */}
          <div
            className="px-6 py-10 md:px-10"
            style={{ borderRight: '1.5px solid var(--ink)' }}
          >
            <div className="font-mono text-xs uppercase tracking-[0.14em] text-ink/70">
              ↑ MOST-SAVED CATEGORIES
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {CATEGORIES.map((r, i) => (
                <div
                  key={r.c}
                  className="grid items-center gap-3"
                  style={{ gridTemplateColumns: '24px 1.5fr 3fr 70px' }}
                >
                  <span className="font-mono text-xs text-ink/40">0{i + 1}</span>
                  <span className="text-sm font-semibold">{r.c}</span>
                  <div
                    className="relative h-4 overflow-hidden rounded-full"
                    style={{ background: 'var(--ink-08)', border: '1px solid var(--ink-15)' }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${r.pct}%`,
                        background:
                          i === 0
                            ? 'var(--lime)'
                            : i === 1
                              ? 'var(--tomato)'
                              : 'var(--ink)',
                      }}
                    />
                  </div>
                  <span className="text-right font-mono text-sm font-bold">${r.$}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next deals */}
          <div className="px-6 py-10 md:px-10">
            <div className="font-mono text-xs uppercase tracking-[0.14em] text-ink/70">
              ✦ DEALS DROPPING THIS WEEK
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {NEXT_DEALS.map((d) => (
                <div
                  key={d.t}
                  className="brut-card flex items-center gap-3.5 p-3.5"
                >
                  <div
                    className="bignum flex size-11 items-center justify-center rounded-xl border-[1.5px] border-ink text-xl tracking-tighter"
                    style={{ background: 'var(--tomato)', color: 'var(--cream)' }}
                  >
                    {d.d}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{d.t}</div>
                    <div className="font-mono text-[11px] tracking-wider text-ink/70">
                      {d.store}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[11px] text-ink/40 line-through">
                      ${d.was}
                    </div>
                    <div
                      className="font-mono text-lg font-bold"
                      style={{ color: 'var(--cobalt)' }}
                    >
                      ${d.now}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
