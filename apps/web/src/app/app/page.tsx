import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'The mobile companion · Point. Scan. Save.',
  description:
    'SmartShopper in the aisle — scan a product, see if it is cheaper within a 5 km drive, before you put it in your cart.',
};

const WEEK_ROWS: Array<[string, string]> = [
  ['MON · oat milk', '–$2.10'],
  ['MON · sourdough', '–$1.40'],
  ['TUE · avocados', '–$2.50'],
  ['WED · eggs ×2', '–$3.60'],
  ['THU · coffee 500g', '–$3.50'],
  ['FRI · chicken breast', '–$8.40'],
  ['SAT · pantry run', '–$11.20'],
  ['SUN · produce', '–$6.97'],
];

const PHONE_2_STORES = [
  { s: 'AL', n: 'ALDI', p: '3.19', best: true },
  { s: 'CO', n: 'COLES', p: '3.60' },
  { s: 'WW', n: 'WOOLWORTHS', p: '3.60' },
  { s: 'IG', n: 'IGA', p: '3.80' },
];

export default function MobileFlowPage() {
  return (
    <>
      <SiteHeader />
      <main className="ss-grain">
        {/* HEADER */}
        <div className="container grid gap-8 px-6 py-10 md:grid-cols-2 md:px-10 md:py-14">
          <h1 className="bignum text-[clamp(56px,10vw,108px)] leading-[0.92]">
            POINT.
            <br />
            <span style={{ color: 'var(--tomato)' }}>SCAN.</span>
            <br />
            <span className="mark-lime">SAVE.</span>
          </h1>
          <div className="md:pt-3">
            <div className="font-mono text-xs uppercase tracking-[0.14em] text-ink/70">
              ◉ THE WHOLE FLOW · 8 SECONDS
            </div>
            <p className="mt-3 text-lg leading-relaxed text-ink/70">
              In the aisle. Camera up. We&rsquo;ll tell you if there&rsquo;s a cheaper version
              within a 5 km drive — before you put it in your cart.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <span className="ss-chip ss-chip--lime">↓ avg $1.42 saved/scan</span>
              <span className="ss-chip">Works offline-first</span>
            </div>
          </div>
        </div>

        {/* PHONES ROW */}
        <div className="relative flex flex-col items-center justify-center gap-8 px-6 pb-16 md:flex-row md:gap-16 md:px-10">
          {/* Arrows (desktop only) */}
          <Arrow className="hidden md:flex" style={{ left: 'calc(33.3% - 28px)' }} />
          <Arrow className="hidden md:flex" style={{ left: 'calc(66.6% - 28px)' }} />

          {/* PHONE 1 — SCAN */}
          <Phone label="01 · SCAN">
            <div className="relative h-full overflow-hidden bg-ink">
              {[
                { top: 24, left: 24 },
                { top: 24, right: 24 },
                { bottom: 110, left: 24 },
                { bottom: 110, right: 24 },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute size-9"
                  style={{ border: '3px solid var(--lime)', ...p }}
                />
              ))}
              <div
                className="absolute left-1/2 top-[32%] flex size-[100px] -translate-x-1/2 items-center justify-center rounded-xl text-center font-mono text-[10px] leading-relaxed tracking-widest"
                style={{
                  width: 100,
                  height: 140,
                  background: 'rgba(220,255,61,0.08)',
                  border: '1.5px dashed var(--lime)',
                  color: 'var(--lime)',
                }}
              >
                [ PRODUCT
                <br />
                IN FRAME ]
              </div>
              <div
                className="absolute left-6 right-6 top-[46%] h-0.5"
                style={{ background: 'var(--tomato)', boxShadow: '0 0 12px var(--tomato)' }}
              />
              <div
                className="absolute inset-x-0 top-[70px] text-center font-mono text-[11px] tracking-[0.16em]"
                style={{ color: 'var(--cream)' }}
              >
                ◉ ANALYZING · TIM TAM 200G
              </div>
              <div
                className="absolute inset-x-3.5 bottom-9 flex items-center gap-2.5 rounded-2xl border-[1.5px] border-ink p-3"
                style={{
                  background: 'var(--lime)',
                  boxShadow: '0 4px 0 var(--ink)',
                }}
              >
                <div
                  className="flex size-9 items-center justify-center rounded-xl font-display text-base"
                  style={{ background: 'var(--ink)', color: 'var(--lime)' }}
                >
                  ↓
                </div>
                <div className="flex-1">
                  <div className="font-mono text-[10px] text-ink/70">CHEAPER ELSEWHERE</div>
                  <div className="font-display text-[17px] tracking-tight">$2.75 at COLES</div>
                </div>
                <div className="font-mono text-sm font-bold">–$0.90</div>
              </div>
            </div>
          </Phone>

          {/* PHONE 2 — COMPARE */}
          <Phone label="02 · COMPARE">
            <div className="relative h-full overflow-hidden px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] text-ink/70">← BACK</div>
                <span className="ss-chip ss-chip--tomato" style={{ fontSize: 10, padding: '4px 8px' }}>
                  ● live
                </span>
              </div>
              <div className="bignum mt-3.5 text-[26px] leading-tight">
                TIM TAM
                <br />
                <span className="text-ink/40 text-lg">200G · ORIGINAL</span>
              </div>
              <div className="mt-3 flex items-baseline gap-2.5">
                <div className="bignum text-[44px]" style={{ color: 'var(--cobalt)' }}>
                  $2.75
                </div>
                <div className="text-[11px] text-ink/70">
                  <div className="line-through">$5.50 typical</div>
                  <div className="font-bold" style={{ color: 'var(--tomato)' }}>
                    Save 50%
                  </div>
                </div>
              </div>
              <div className="dot-rule my-3" />
              <div className="flex flex-col gap-2">
                {PHONE_2_STORES.map((r) => (
                  <div
                    key={r.n}
                    className="flex items-center gap-2.5 rounded-[10px] p-2"
                    style={{
                      background: r.best ? 'var(--lime)' : 'transparent',
                      border: r.best ? '1.5px solid var(--ink)' : '1px dashed var(--ink-15)',
                    }}
                  >
                    <span
                      className="store__bug"
                      style={{
                        width: 22,
                        height: 22,
                        fontSize: 10,
                        background: r.best ? 'var(--ink)' : 'var(--cream-2)',
                        color: r.best ? 'var(--lime)' : 'var(--ink)',
                      }}
                    >
                      {r.s}
                    </span>
                    <span className="flex-1 text-xs font-semibold">{r.n}</span>
                    <span className="font-mono text-sm font-bold">${r.p}</span>
                  </div>
                ))}
              </div>
              <button
                className="absolute inset-x-3.5 bottom-12 rounded-full border-[1.5px] border-ink py-3.5 text-[13px] font-bold uppercase tracking-wide"
                style={{
                  background: 'var(--ink)',
                  color: 'var(--lime)',
                  boxShadow: '0 4px 0 var(--lime-deep)',
                }}
              >
                GET DIRECTIONS · 1.8 KM →
              </button>
            </div>
          </Phone>

          {/* PHONE 3 — SAVED */}
          <Phone label="03 · SAVED">
            <div
              className="relative h-full overflow-hidden px-4 py-4"
              style={{ background: 'var(--lime)' }}
            >
              <div className="font-mono text-[10px] tracking-[0.18em]">◉ WEEK 19 · TALLY</div>
              <div className="bignum mt-4 text-[80px] leading-[0.9] tracking-tighter">
                $84<span style={{ color: 'var(--tomato)' }}>.</span>
                <span style={{ fontSize: 48 }}>17</span>
              </div>
              <div className="mt-1 text-sm">saved this week.</div>
              <div className="dot-rule my-4" />
              <div className="flex flex-col gap-1.5 font-mono text-[11px]">
                {WEEK_ROWS.map(([l, r]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-ink/70">{l}</span>
                    <span className="font-bold">{r}</span>
                  </div>
                ))}
              </div>
              <div
                className="absolute inset-x-3.5 bottom-4 flex items-center justify-between rounded-2xl px-3.5 py-3"
                style={{ background: 'var(--ink)', color: 'var(--cream)' }}
              >
                <div>
                  <div
                    className="font-mono text-[10px] tracking-[0.14em]"
                    style={{ color: 'var(--lime)' }}
                  >
                    NEXT GOAL
                  </div>
                  <div className="font-display text-base">$100 in a week</div>
                </div>
                <div className="font-mono text-xl font-bold" style={{ color: 'var(--lime)' }}>
                  84%
                </div>
              </div>
            </div>
          </Phone>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Phone({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative shrink-0" style={{ width: 300, height: 620 }}>
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background: 'var(--paper)',
          border: '8px solid var(--ink)',
          borderRadius: 44,
          boxShadow: '8px 8px 0 var(--ink)',
        }}
      >
        <div className="flex items-center justify-between px-6 pb-1.5 pt-3.5 font-mono text-xs font-bold">
          <span>9:41</span>
          <span
            className="block h-5 w-[70px] rounded-full"
            style={{ background: 'var(--ink)' }}
          />
          <span>● ▮▮▮</span>
        </div>
        <div className="h-[calc(100%-44px)]">{children}</div>
      </div>
      <div className="absolute inset-x-0 -bottom-8 text-center font-mono text-[11px] tracking-[0.18em] text-ink/70">
        {label}
      </div>
    </div>
  );
}

function Arrow({ style, className = '' }: { style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={`absolute top-1/2 z-10 flex size-14 items-center justify-center ${className}`}
      style={{ transform: 'translateY(-50%)', ...style }}
    >
      <div
        className="font-display text-3xl leading-none"
        style={{
          color: 'var(--ink)',
          background: 'var(--tomato)',
          border: '1.5px solid var(--ink)',
          borderRadius: 100,
          padding: '0 14px 4px',
          boxShadow: '3px 3px 0 var(--ink)',
        }}
      >
        →
      </div>
    </div>
  );
}
