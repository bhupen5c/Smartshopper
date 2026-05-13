/* global React */
const { Fragment } = React;

/* =====================================================================
   ARTBOARD 1 · LANDING HERO
   "Stop overpaying" — bold typographic hero with live comparison panel
   ===================================================================== */
function HeroLanding() {
  return (
    <div className="ss-board ss-grain" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* ticker */}
      <div className="ticker">
        <div className="ticker__track">
          {[...Array(2)].map((_, i) => (
            <Fragment key={i}>
              <span className="ticker__item">EGGS, DOZEN <span className="down">↓ $2.99 ALDI</span></span>
              <span>·</span>
              <span className="ticker__item">OAT MILK <span className="down">↓ $3.49 TRADER J</span></span>
              <span>·</span>
              <span className="ticker__item">RIBEYE /LB <span className="up">↑ $14.20 KROGER</span></span>
              <span>·</span>
              <span className="ticker__item">AVOCADO 4PK <span className="down">↓ $4.99 COSTCO</span></span>
              <span>·</span>
              <span className="ticker__item">COFFEE 12OZ <span className="down">↓ $7.49 TARGET</span></span>
              <span>·</span>
              <span className="ticker__item">PAPER TWLS <span className="up">↑ $18.40 WALMART</span></span>
              <span>·</span>
            </Fragment>
          ))}
        </div>
      </div>

      {/* nav */}
      <nav className="ss-nav">
        <div className="ss-nav__logo">
          <span className="dot"></span> SMARTSHOPPER<span style={{ color: 'var(--tomato)' }}>.</span>
        </div>
        <div className="ss-nav__links">
          <a className="active" href="#">Compare</a>
          <a href="#">Deals</a>
          <a href="#">Lists</a>
          <a href="#">How it works</a>
        </div>
        <button className="ss-nav__cta">Start saving <span className="arrow">→</span></button>
      </nav>

      {/* HERO BODY */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.25fr 1fr',
        gap: 48,
        padding: '56px 56px 40px',
        flex: 1,
        position: 'relative',
      }}>
        {/* LEFT — headline */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
            <span className="chip chip--lime">↓ 247K shoppers</span>
            <span className="chip">Avg. save $84/wk</span>
          </div>

          <h1 className="bignum" style={{
            fontSize: 158,
            margin: 0,
            color: 'var(--ink)',
          }}>
            STOP<br/>
            <span style={{ color: 'var(--tomato)' }}>OVER</span>—<br/>
            PAYING.
          </h1>

          <p style={{
            fontFamily: 'var(--ui)',
            fontSize: 20,
            lineHeight: 1.4,
            maxWidth: 520,
            marginTop: 32,
            color: 'var(--ink-70)',
          }}>
            Smartshopper compares <span className="mark-lime"><b>62 retailers</b></span> in real
            time so you always buy at the bottom of the price curve.
            One search. Every store. Zero spreadsheets.
          </p>

          <div style={{ display: 'flex', gap: 14, marginTop: 36, alignItems: 'center' }}>
            <button className="btn-lime">Compare a product →</button>
            <button className="btn-outline">Watch the 90s demo</button>
          </div>

          {/* avatar strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 36 }}>
            <div style={{ display: 'flex' }}>
              {['#FF4D2E', '#DCFF3D', '#2A3CFF', '#0F0F0E', '#F7F2E7'].map((c, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: c, border: '1.5px solid var(--ink)',
                  marginLeft: i === 0 ? 0 : -10,
                }} />
              ))}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.3 }}>
              <div style={{ fontWeight: 600 }}>★★★★★ 4.9 · 18,402 reviews</div>
              <div style={{ color: 'var(--ink-70)' }}>"Cancelled three subscriptions." — Wirecutter</div>
            </div>
          </div>
        </div>

        {/* RIGHT — live comparison card */}
        <div style={{ position: 'relative' }}>
          <div className="tape" style={{ top: -14, right: 60 }}></div>
          <div style={{
            background: 'var(--paper)',
            border: '1.5px solid var(--ink)',
            borderRadius: 'var(--r-lg)',
            boxShadow: '10px 10px 0 var(--ink)',
            padding: 24,
            transform: 'rotate(1.5deg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-70)' }}>
                  Live comparison · 0.41s
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 28, marginTop: 6, letterSpacing: '-0.02em' }}>
                  Organic eggs, 12ct
                </div>
              </div>
              <span className="chip chip--tomato">⬤ live</span>
            </div>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { s: 'AL', name: 'ALDI',         price: '$2.99', delta: '-38%', best: true },
                { s: 'TJ', name: "TRADER JOE'S", price: '$3.49', delta: '-28%' },
                { s: 'CO', name: 'COSTCO',       price: '$3.89', delta: '-19%' },
                { s: 'KR', name: 'KROGER',       price: '$4.29', delta: '-11%' },
                { s: 'WF', name: 'WHOLE FOODS',  price: '$4.79', delta: '—' },
              ].map((r) => (
                <div key={r.name} style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 1fr',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: r.best ? 'var(--lime)' : 'transparent',
                  border: r.best ? '1.5px solid var(--ink)' : '1px dashed var(--ink-15)',
                }}>
                  <div className="store">
                    <span className="store__bug" style={{
                      background: r.best ? 'var(--ink)' : 'var(--cream-2)',
                      color: r.best ? 'var(--lime)' : 'var(--ink)',
                    }}>{r.s}</span>
                    {r.name}
                    {r.best && <span style={{
                      fontFamily: 'var(--ui)', fontSize: 10, letterSpacing: '0.1em',
                      background: 'var(--ink)', color: 'var(--lime)',
                      padding: '2px 6px', borderRadius: 100, marginLeft: 4,
                    }}>BEST</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 600 }}>{r.price}</div>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 13,
                    textAlign: 'right',
                    color: r.delta === '—' ? 'var(--ink-40)' : 'var(--ink)',
                    fontWeight: 600,
                  }}>{r.delta}</div>
                </div>
              ))}
            </div>

            <div className="dot-rule" style={{ margin: '16px 0' }}></div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-70)' }}>
                YOU SAVE
              </div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 32, color: 'var(--tomato)', letterSpacing: '-0.02em' }}>
                –$1.80
              </div>
            </div>
          </div>

          {/* satellite badge */}
          <div style={{
            position: 'absolute',
            bottom: -22,
            left: -28,
            background: 'var(--cobalt)',
            color: 'var(--cream)',
            border: '1.5px solid var(--ink)',
            borderRadius: 100,
            padding: '10px 18px',
            fontFamily: 'var(--ui)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transform: 'rotate(-6deg)',
            boxShadow: '4px 4px 0 var(--ink)',
          }}>
            ★ 62 stores · updated every 90s
          </div>
        </div>
      </div>

      {/* bottom strip — value props */}
      <div style={{
        borderTop: '1.5px solid var(--ink)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: 'var(--cream)',
      }}>
        {[
          ['01', 'Search anything',        'A product name, a barcode, even a recipe.'],
          ['02', 'See every price',         'Sorted lowest first. Updated every 90 seconds.'],
          ['03', 'Skip the loyalty cards',  'Coupon stacks applied automatically.'],
          ['04', 'Buy or save',             'Add to list, set an alert, or click to checkout.'],
        ].map(([n, t, d], i) => (
          <div key={n} style={{
            padding: '24px 28px',
            borderRight: i < 3 ? '1.5px solid var(--ink)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--tomato)' }}>/ {n}</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, marginTop: 8, letterSpacing: '-0.01em' }}>{t}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-70)', marginTop: 6, lineHeight: 1.4 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.HeroLanding = HeroLanding;
