/* global React */

/* =====================================================================
   ARTBOARD 3 · SAVINGS DASHBOARD / RECEIPT
   Personal YTD savings — receipt aesthetic + bar chart typography
   ===================================================================== */
function SavingsDashboard() {
  const months = [
    { m: 'JAN', v: 64, $: 98 },
    { m: 'FEB', v: 71, $: 112 },
    { m: 'MAR', v: 58, $: 84 },
    { m: 'APR', v: 89, $: 142 },
    { m: 'MAY', v: 76, $: 121 },
    { m: 'JUN', v: 92, $: 158 },
    { m: 'JUL', v: 84, $: 134 },
    { m: 'AUG', v: 67, $: 102 },
    { m: 'SEP', v: 78, $: 118 },
    { m: 'OCT', v: 95, $: 168 },
    { m: 'NOV', v: 88, $: 144 },
    { m: 'DEC', v: 42, $: 66 },
  ];

  return (
    <div className="ss-board ss-grain" style={{ display: 'flex', flexDirection: 'column' }}>
      <nav className="ss-nav">
        <div className="ss-nav__logo">
          <span className="dot"></span> SMARTSHOPPER<span style={{ color: 'var(--tomato)' }}>.</span>
        </div>
        <div className="ss-nav__links">
          <a href="#">Compare</a>
          <a href="#">Deals</a>
          <a href="#">Lists</a>
          <a className="active" href="#">My Savings</a>
        </div>
        <button className="ss-nav__cta">Hi, Maya <span className="arrow">M</span></button>
      </nav>

      {/* HERO STRIP */}
      <div style={{
        padding: '40px 56px 32px',
        display: 'grid',
        gridTemplateColumns: '1.3fr 1fr',
        gap: 48,
        borderBottom: '1.5px solid var(--ink)',
        position: 'relative',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.16em', color: 'var(--ink-70)' }}>
            ◉ YEAR–TO–DATE · 2026
          </div>
          <h1 className="bignum" style={{ fontSize: 132, margin: '6px 0 0', letterSpacing: '-0.04em' }}>
            <span style={{ color: 'var(--ink-40)', fontSize: 70 }}>$</span>
            <span>1,447</span>
            <span style={{ color: 'var(--tomato)' }}>.</span>
            <span style={{ fontSize: 70 }}>82</span>
          </h1>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 22, marginTop: 4, color: 'var(--ink-70)' }}>
            saved across <b style={{ color: 'var(--ink)' }}>317 trips</b> · 38 stores compared
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <span className="chip chip--lime">↑ 24% vs last year</span>
            <span className="chip">Streak · 11 wks</span>
            <span className="chip chip--tomato">Top 3% saver</span>
          </div>
        </div>

        {/* Receipt */}
        <div className="receipt" style={{ transform: 'rotate(-1deg)' }}>
          <div style={{
            padding: '14px 18px',
            textAlign: 'center',
            borderBottom: '1.5px dashed var(--ink)',
          }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 18, letterSpacing: '0.02em' }}>SMARTSHOPPER</div>
            <div style={{ fontSize: 10, color: 'var(--ink-70)', letterSpacing: '0.1em' }}>
              ◤ ANNUAL RECAP · MAY 13 ◥
            </div>
          </div>
          <div className="receipt__row"><span>Cheapest store hit</span><span>ALDI · 84×</span></div>
          <div className="receipt__row"><span>Biggest single save</span><span>$42.18</span></div>
          <div className="receipt__row"><span>Most-tracked item</span><span>Oat milk</span></div>
          <div className="receipt__row"><span>Coupons stacked</span><span>118</span></div>
          <div className="receipt__row"><span>Avg trip savings</span><span>$4.57</span></div>
          <div className="receipt__row"><span>Hrs not in spreadsheets</span><span>27h</span></div>
          <div style={{
            padding: '14px 18px',
            background: 'var(--ink)',
            color: 'var(--lime)',
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--mono)',
            fontWeight: 700,
            fontSize: 14,
          }}>
            <span>TOTAL SAVED</span><span>$1,447.82</span>
          </div>
          <div style={{
            padding: '10px 18px',
            fontFamily: 'var(--mono)',
            fontSize: 10,
            textAlign: 'center',
            color: 'var(--ink-70)',
            letterSpacing: '0.1em',
          }}>
            ◤◤◤ THANK YOU FOR SHOPPING SMART ◥◥◥
          </div>
        </div>
      </div>

      {/* CHART STRIP */}
      <div style={{ padding: '32px 56px 32px', borderBottom: '1.5px solid var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--ink-70)' }}>
              MONTHLY SAVINGS · 2026
            </div>
            <div className="bignum" style={{ fontSize: 36, marginTop: 4, letterSpacing: '-0.02em' }}>
              Best month: <span className="mark-lime">October</span>, <span style={{ fontFamily: 'var(--mono)', fontSize: 28 }}>$168</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="chip">Weekly</span>
            <span className="chip chip--ink">Monthly</span>
            <span className="chip">Yearly</span>
          </div>
        </div>

        {/* Bars */}
        <div style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 10,
          alignItems: 'end',
          height: 200,
        }}>
          {months.map((m, i) => (
            <div key={m.m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 11,
                color: m.v > 90 ? 'var(--tomato)' : 'var(--ink-70)',
                fontWeight: 700,
              }}>${m.$}</div>
              <div style={{
                width: '100%',
                height: `${m.v}%`,
                background: m.v > 90 ? 'var(--tomato)' : (m.m === 'MAY' ? 'var(--cobalt)' : 'var(--lime)'),
                border: '1.5px solid var(--ink)',
                borderBottom: 'none',
                borderRadius: '6px 6px 0 0',
              }} />
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 11,
                color: m.m === 'MAY' ? 'var(--cobalt)' : 'var(--ink-70)',
                letterSpacing: '0.08em',
                fontWeight: m.m === 'MAY' ? 700 : 400,
              }}>{m.m}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TWO COLUMN LIST */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        flex: 1,
      }}>
        {/* TOP SAVERS LEADERBOARD */}
        <div style={{ padding: '28px 36px 28px 56px', borderRight: '1.5px solid var(--ink)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--ink-70)' }}>
            ↑ MOST-SAVED CATEGORIES
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { c: 'Dairy & Eggs',  $: 284, pct: 92 },
              { c: 'Produce',       $: 241, pct: 78 },
              { c: 'Pantry',        $: 198, pct: 64 },
              { c: 'Meat & Seafood',$: 176, pct: 57 },
              { c: 'Snacks',        $: 142, pct: 46 },
              { c: 'Household',     $:  88, pct: 28 },
            ].map((r, i) => (
              <div key={r.c} style={{ display: 'grid', gridTemplateColumns: '24px 1.5fr 3fr 70px', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-40)' }}>0{i+1}</span>
                <span style={{ fontFamily: 'var(--ui)', fontWeight: 600, fontSize: 14 }}>{r.c}</span>
                <div style={{ height: 16, background: 'var(--ink-08)', borderRadius: 100, position: 'relative', border: '1px solid var(--ink-15)' }}>
                  <div style={{
                    width: `${r.pct}%`, height: '100%',
                    background: i === 0 ? 'var(--lime)' : i === 1 ? 'var(--tomato)' : 'var(--ink)',
                    borderRadius: 100,
                  }} />
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, textAlign: 'right' }}>${r.$}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NEXT DEALS */}
        <div style={{ padding: '28px 56px 28px 36px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--ink-70)' }}>
            ✦ DEALS DROPPING THIS WEEK
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { t: 'Greek yogurt 32oz',    store: 'TRADER JOE\'S', was: '5.99', now: '3.99', d: 'Tue' },
              { t: 'Avocados, bag of 4',   store: 'COSTCO',        was: '7.49', now: '4.99', d: 'Wed' },
              { t: 'Olive oil 750ml',      store: 'ALDI',          was: '12.99',now: '8.49', d: 'Fri' },
              { t: 'Sparkling water 12pk', store: 'TARGET',        was: '6.49', now: '4.29', d: 'Sat' },
            ].map((d, i) => (
              <div key={d.t} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px',
                background: 'var(--paper)',
                border: '1.5px solid var(--ink)',
                borderRadius: 12,
              }}>
                <div className="bignum" style={{
                  fontSize: 22,
                  background: 'var(--tomato)',
                  color: 'var(--cream)',
                  width: 44, height: 44,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  letterSpacing: '-0.02em',
                  border: '1.5px solid var(--ink)',
                }}>{d.d}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{d.t}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-70)' }}>{d.store}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textDecoration: 'line-through', color: 'var(--ink-40)' }}>
                    ${d.was}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: 'var(--cobalt)' }}>
                    ${d.now}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.SavingsDashboard = SavingsDashboard;
