/* global React */

/* =====================================================================
   ARTBOARD 4 · MOBILE FLOW
   Three phone screens: scan → compare → success
   ===================================================================== */

const Phone = ({ children, label, time = '9:41' }) => (
  <div style={{
    width: 300,
    height: 620,
    background: 'var(--paper)',
    border: '8px solid var(--ink)',
    borderRadius: 44,
    boxShadow: '8px 8px 0 var(--ink)',
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  }}>
    {/* status bar */}
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 26px 6px',
      fontFamily: 'var(--mono)',
      fontSize: 12,
      fontWeight: 700,
    }}>
      <span>{time}</span>
      <span style={{
        width: 70, height: 22,
        background: 'var(--ink)',
        borderRadius: 100,
      }}></span>
      <span>● ▮▮▮</span>
    </div>
    {/* label */}
    <div style={{
      position: 'absolute', bottom: -34, left: 0, right: 0,
      textAlign: 'center',
      fontFamily: 'var(--mono)',
      fontSize: 11,
      letterSpacing: '0.18em',
      color: 'var(--ink-70)',
    }}>{label}</div>
    {children}
  </div>
);

function MobileFlow() {
  return (
    <div className="ss-board ss-grain" style={{ display: 'flex', flexDirection: 'column' }}>
      <nav className="ss-nav">
        <div className="ss-nav__logo">
          <span className="dot"></span> SMARTSHOPPER<span style={{ color: 'var(--tomato)' }}>.</span> <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-70)', marginLeft: 8 }}>/ iOS</span>
        </div>
        <div className="ss-nav__links">
          <a href="#">Web</a>
          <a className="active" href="#">App</a>
          <a href="#">Extension</a>
        </div>
        <button className="ss-nav__cta">Get the app <span className="arrow">↓</span></button>
      </nav>

      {/* Header */}
      <div style={{ padding: '36px 56px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <div className="bignum" style={{ fontSize: 64, lineHeight: 0.95, letterSpacing: '-0.03em' }}>
            POINT.<br/>
            <span style={{ color: 'var(--tomato)' }}>SCAN.</span><br/>
            <span className="mark-lime">SAVE.</span>
          </div>
        </div>
        <div style={{ paddingTop: 12 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.14em', color: 'var(--ink-70)' }}>
            ◉ THE WHOLE FLOW · 8 SECONDS
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.5, marginTop: 12, color: 'var(--ink-70)' }}>
            In the aisle. Camera up. We&rsquo;ll tell you if there&rsquo;s a cheaper version
            within a 5-mile drive — before you put it in your cart.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <span className="chip chip--lime">↓ avg $1.42 saved/scan</span>
            <span className="chip">Works offline-first</span>
          </div>
        </div>
      </div>

      {/* PHONES ROW */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 64,
        flex: 1,
        padding: '40px 56px 60px',
        position: 'relative',
      }}>
        {/* arrows between phones */}
        <Arrow style={{ left: '32.7%', top: '52%' }} />
        <Arrow style={{ left: '64.3%', top: '52%' }} />

        {/* PHONE 1 — SCAN */}
        <Phone label="01 · SCAN">
          <div style={{ height: 'calc(100% - 36px)', background: '#0F0F0E', position: 'relative', overflow: 'hidden' }}>
            {/* viewfinder corner brackets */}
            {[
              { top: 24, left: 24, br: '0 1.5px 0 1.5px' },
              { top: 24, right: 24, br: '0 0 1.5px 1.5px' },
              { bottom: 110, left: 24, br: '1.5px 1.5px 0 0' },
              { bottom: 110, right: 24, br: '1.5px 0 0 1.5px' },
            ].map((p, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: 36, height: 36,
                border: '3px solid var(--lime)',
                ...p,
              }}></div>
            ))}

            {/* fake product silhouette */}
            <div style={{
              position: 'absolute',
              top: '32%', left: '50%', transform: 'translateX(-50%)',
              width: 100, height: 140,
              background: 'rgba(220, 255, 61, 0.08)',
              border: '1.5px dashed var(--lime)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--lime)',
              letterSpacing: '0.1em',
              textAlign: 'center',
              lineHeight: 1.5,
            }}>
              [ PRODUCT<br/>IN FRAME ]
            </div>

            {/* scan line */}
            <div style={{
              position: 'absolute',
              top: '46%', left: 24, right: 24,
              height: 2, background: 'var(--tomato)',
              boxShadow: '0 0 12px var(--tomato)',
            }}></div>

            {/* Caption */}
            <div style={{
              position: 'absolute',
              top: 70, left: 0, right: 0,
              textAlign: 'center',
              fontFamily: 'var(--mono)',
              color: 'var(--cream)',
              fontSize: 11,
              letterSpacing: '0.16em',
            }}>
              ◉ ANALYZING · OAT MILK 32OZ
            </div>

            {/* Result peek */}
            <div style={{
              position: 'absolute',
              bottom: 36, left: 14, right: 14,
              background: 'var(--lime)',
              border: '1.5px solid var(--ink)',
              borderRadius: 16,
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 4px 0 var(--ink)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--ink)', color: 'var(--lime)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--display)', fontSize: 14,
              }}>↓</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-70)', fontFamily: 'var(--mono)' }}>CHEAPER ELSEWHERE</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 17, letterSpacing: '-0.01em' }}>$3.49 at TJ&rsquo;s</div>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14 }}>–$2.10</div>
            </div>
          </div>
        </Phone>

        {/* PHONE 2 — COMPARE */}
        <Phone label="02 · COMPARE">
          <div style={{ padding: '16px 18px', height: 'calc(100% - 36px)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-70)' }}>← BACK</div>
              <div className="chip chip--tomato" style={{ fontSize: 10, padding: '4px 8px' }}>● live</div>
            </div>

            <div className="bignum" style={{ fontSize: 26, marginTop: 14, lineHeight: 1 }}>
              OAT MILK<br/>
              <span style={{ color: 'var(--ink-40)', fontSize: 18 }}>32oz · OATLY ORIGINAL</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 12 }}>
              <div className="bignum" style={{ fontSize: 44, color: 'var(--cobalt)' }}>$3.49</div>
              <div style={{ fontSize: 11, color: 'var(--ink-70)' }}>
                <div style={{ textDecoration: 'line-through' }}>$5.59 typical</div>
                <div style={{ color: 'var(--tomato)', fontWeight: 700 }}>Save 38%</div>
              </div>
            </div>

            <div className="dot-rule" style={{ margin: '14px 0 10px' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { s:'TJ', n:"TRADER JOE'S", p:'3.49', best:true },
                { s:'AL', n:'ALDI',          p:'3.79' },
                { s:'TG', n:'TARGET',        p:'4.29' },
                { s:'WF', n:'WHOLE FOODS',   p:'5.59' },
              ].map((r) => (
                <div key={r.n} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px',
                  background: r.best ? 'var(--lime)' : 'transparent',
                  border: r.best ? '1.5px solid var(--ink)' : '1px dashed var(--ink-15)',
                  borderRadius: 10,
                }}>
                  <span className="store__bug" style={{
                    width: 22, height: 22, fontSize: 10,
                    background: r.best ? 'var(--ink)' : 'var(--cream-2)',
                    color: r.best ? 'var(--lime)' : 'var(--ink)',
                  }}>{r.s}</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{r.n}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14 }}>${r.p}</span>
                </div>
              ))}
            </div>

            <button style={{
              position: 'absolute',
              bottom: 56, left: 14, right: 14,
              background: 'var(--ink)',
              color: 'var(--lime)',
              border: '1.5px solid var(--ink)',
              borderRadius: 100,
              padding: '14px',
              fontFamily: 'var(--ui)',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.04em',
              boxShadow: '0 4px 0 var(--lime-deep)',
            }}>GET DIRECTIONS · 1.8 MI →</button>
          </div>
        </Phone>

        {/* PHONE 3 — SAVED */}
        <Phone label="03 · SAVED">
          <div style={{
            background: 'var(--lime)',
            height: 'calc(100% - 36px)',
            padding: '16px 18px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em' }}>◉ WEEK 19 · TALLY</div>

            <div className="bignum" style={{ fontSize: 80, marginTop: 18, lineHeight: 0.9, letterSpacing: '-0.04em' }}>
              $84
              <span style={{ color: 'var(--tomato)' }}>.</span>
              <span style={{ fontSize: 48 }}>17</span>
            </div>
            <div style={{ fontSize: 14, marginTop: 4 }}>saved this week.</div>

            <div className="dot-rule" style={{ margin: '20px 0 14px' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--mono)', fontSize: 11 }}>
              <Row left="MON · oat milk"     right="–$2.10" />
              <Row left="MON · sourdough"    right="–$1.40" />
              <Row left="TUE · avocados"     right="–$2.50" />
              <Row left="WED · eggs ×2"      right="–$3.60" />
              <Row left="THU · coffee 12oz"  right="–$3.50" />
              <Row left="FRI · ribeye"       right="–$8.40" />
              <Row left="SAT · pantry run"   right="–$11.20" />
              <Row left="SUN · produce"      right="–$6.97" />
            </div>

            <div style={{
              position: 'absolute',
              bottom: 18, left: 14, right: 14,
              background: 'var(--ink)',
              color: 'var(--cream)',
              borderRadius: 16,
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--lime)', letterSpacing: '0.14em' }}>NEXT GOAL</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 16, marginTop: 2 }}>$100 in a week</div>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 20, color: 'var(--lime)', fontWeight: 700 }}>84%</div>
            </div>
          </div>
        </Phone>
      </div>
    </div>
  );
}

function Row({ left, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--ink-70)' }}>{left}</span>
      <span style={{ fontWeight: 700 }}>{right}</span>
    </div>
  );
}

function Arrow({ style }) {
  return (
    <div style={{
      position: 'absolute',
      width: 60,
      height: 30,
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}>
      <div style={{
        fontFamily: 'var(--display)',
        fontSize: 30,
        color: 'var(--ink)',
        background: 'var(--tomato)',
        border: '1.5px solid var(--ink)',
        borderRadius: 100,
        padding: '0px 14px 4px',
        boxShadow: '3px 3px 0 var(--ink)',
        lineHeight: 1,
      }}>→</div>
    </div>
  );
}

window.MobileFlow = MobileFlow;
