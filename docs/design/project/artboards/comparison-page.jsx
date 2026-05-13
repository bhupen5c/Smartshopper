/* global React */

/* =====================================================================
   ARTBOARD 2 · PRODUCT COMPARISON PAGE
   Detailed comparison view — one product, every store, every detail
   ===================================================================== */
function ComparisonPage() {
  const stores = [
    { s:'AL', name:'ALDI',           price:'2.99', unit:'$0.25/ea', deliv:'In-store · 2.1 mi', stock:'In stock', total:'2.99', tag:'CHEAPEST', deal:'Loss leader · Wed' },
    { s:'TJ', name:"TRADER JOE'S",   price:'3.49', unit:'$0.29/ea', deliv:'In-store · 3.4 mi', stock:'In stock', total:'3.49', tag:null,        deal:null },
    { s:'CO', name:'COSTCO',         price:'3.89', unit:'$0.22/ea', deliv:'Pickup 2hr',        stock:'18-pack only', total:'5.84', tag:'BEST UNIT', deal:'Member price' },
    { s:'TG', name:'TARGET',         price:'4.19', unit:'$0.35/ea', deliv:'Drive-up · 60min',  stock:'In stock', total:'4.19', tag:null,        deal:'5% RedCard' },
    { s:'KR', name:'KROGER',         price:'4.29', unit:'$0.36/ea', deliv:'Delivery $4.99',    stock:'In stock', total:'9.28', tag:null,        deal:'Digital coupon' },
    { s:'WM', name:'WALMART',        price:'4.42', unit:'$0.37/ea', deliv:'Free pickup',       stock:'Low stock', total:'4.42', tag:null,        deal:null },
    { s:'WF', name:'WHOLE FOODS',    price:'4.79', unit:'$0.40/ea', deliv:'Prime · 2hr free',  stock:'In stock', total:'4.79', tag:null,        deal:'Prime member' },
    { s:'SP', name:'SPROUTS',        price:'5.29', unit:'$0.44/ea', deliv:'In-store · 5.1 mi', stock:'In stock', total:'5.29', tag:null,        deal:null },
  ];

  return (
    <div className="ss-board ss-grain" style={{ display: 'flex', flexDirection: 'column' }}>
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
        <button className="ss-nav__cta">My savings · $284 <span className="arrow">→</span></button>
      </nav>

      {/* SEARCH BAR */}
      <div style={{ padding: '24px 56px', borderBottom: '1.5px solid var(--ink)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--paper)',
          border: '1.5px solid var(--ink)',
          borderRadius: 100,
          padding: '8px 8px 8px 24px',
          boxShadow: '4px 4px 0 var(--ink)',
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-70)' }}>⌕</span>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 17, fontWeight: 500, flex: 1 }}>
            organic eggs, large, 12 count
          </div>
          <span className="chip">↓ near 94110</span>
          <span className="chip chip--lime">filters · 3</span>
          <button className="btn-ink" style={{ padding: '10px 22px', fontSize: 13 }}>Search →</button>
        </div>
      </div>

      {/* HEADER STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        borderBottom: '1.5px solid var(--ink)',
      }}>
        {/* Title block */}
        <div style={{ padding: '36px 56px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <span className="chip">Grocery</span>
            <span className="chip">Dairy & Eggs</span>
            <span className="chip chip--ink">8 stores compared</span>
          </div>
          <div className="bignum" style={{ fontSize: 76, lineHeight: 0.95, letterSpacing: '-0.03em' }}>
            ORGANIC<br/>
            <span className="mark-lime">LARGE EGGS</span> <span style={{ color: 'var(--ink-40)', fontSize: 60 }}>/ 12ct</span>
          </div>
          <div style={{ marginTop: 18, fontSize: 14, color: 'var(--ink-70)', display: 'flex', gap: 18 }}>
            <span>★ 4.7 · 2,841 cross-store reviews</span>
            <span>↻ Updated 38s ago</span>
            <span>◉ Tracking since Jan 2024</span>
          </div>
        </div>

        {/* Verdict card */}
        <div style={{
          padding: '36px 56px 36px 36px',
          borderLeft: '1.5px solid var(--ink)',
          background: 'var(--ink)',
          color: 'var(--cream)',
          position: 'relative',
        }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
            color: 'var(--lime)',
          }}>SMARTSHOPPER VERDICT</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 14 }}>
            <div className="bignum" style={{ fontSize: 88, color: 'var(--lime)' }}>$2.99</div>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 16 }}>
              <div style={{ textDecoration: 'line-through', color: 'rgba(247,242,231,0.4)' }}>$4.79 typical</div>
              <div style={{ color: 'var(--lime)', fontWeight: 700 }}>Save $1.80 (38%)</div>
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.4 }}>
            Cheapest at <b style={{ color: 'var(--lime)' }}>ALDI · 2.1 mi away</b>. Price has held for 6 days &mdash;
            <span style={{ color: 'var(--tomato)' }}> likely to rise Saturday.</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button className="btn-lime" style={{ padding: '12px 18px', fontSize: 14 }}>Get directions →</button>
            <button style={{
              background: 'transparent',
              color: 'var(--cream)',
              border: '1.5px solid var(--cream)',
              borderRadius: 100,
              padding: '12px 18px',
              fontFamily: 'var(--ui)',
              fontSize: 14,
              fontWeight: 500,
            }}>Set price alert</button>
          </div>
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div style={{ padding: '28px 56px 36px', flex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1.4fr 0.9fr 0.9fr 1.2fr 1fr 1fr 90px',
          padding: '0 16px 12px',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.12em',
          color: 'var(--ink-70)',
          textTransform: 'uppercase',
          gap: 12,
        }}>
          <div>rank</div>
          <div>store</div>
          <div>price</div>
          <div>per egg</div>
          <div>availability</div>
          <div>delivery</div>
          <div style={{ textAlign: 'right' }}>cart total</div>
          <div></div>
        </div>

        <div style={{
          background: 'var(--paper)',
          border: '1.5px solid var(--ink)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}>
          {stores.map((r, i) => {
            const isBest = i === 0;
            return (
              <div key={r.name} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1.4fr 0.9fr 0.9fr 1.2fr 1fr 1fr 90px',
                alignItems: 'center',
                padding: '18px 16px',
                gap: 12,
                background: isBest ? 'var(--lime)' : (i % 2 ? 'transparent' : 'rgba(15,15,14,0.03)'),
                borderBottom: i < stores.length - 1 ? '1px dashed var(--ink-15)' : 'none',
                borderLeft: isBest ? '6px solid var(--tomato)' : '6px solid transparent',
              }}>
                <div className="bignum" style={{
                  fontSize: 28,
                  color: isBest ? 'var(--ink)' : 'var(--ink-40)',
                }}>{String(i + 1).padStart(2, '0')}</div>

                <div className="store">
                  <span className="store__bug" style={{
                    background: isBest ? 'var(--ink)' : 'var(--cream-2)',
                    color: isBest ? 'var(--lime)' : 'var(--ink)',
                  }}>{r.s}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.name}</div>
                    {r.tag && (
                      <div style={{
                        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
                        color: isBest ? 'var(--tomato)' : 'var(--cobalt)',
                        fontWeight: 700, marginTop: 2,
                      }}>★ {r.tag}</div>
                    )}
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700 }}>${r.price}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-70)' }}>{r.unit}</div>
                <div style={{ fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>{r.stock}</div>
                  {r.deal && (
                    <div style={{ fontSize: 11, color: 'var(--tomato)', fontWeight: 600 }}>✦ {r.deal}</div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-70)' }}>{r.deliv}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 14 }}>
                  ${r.total}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button style={{
                    background: isBest ? 'var(--ink)' : 'transparent',
                    color: isBest ? 'var(--lime)' : 'var(--ink)',
                    border: '1.5px solid var(--ink)',
                    borderRadius: 100,
                    padding: '8px 14px',
                    fontFamily: 'var(--ui)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                  }}>{isBest ? 'GO →' : 'ADD'}</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* footer strip */}
        <div style={{
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16,
        }}>
          <FootCard
            label="PRICE HISTORY · 30D"
            big="$4.12 → $2.99"
            note="–27% vs 30-day avg. Below 90-day floor."
            color="var(--lime)"
          />
          <FootCard
            label="FORECAST · 7D"
            big="↑ Likely to rise"
            note="Promo ends Friday. Holds at $4.29 expected."
            color="var(--tomato)"
            inv
          />
          <FootCard
            label="BUNDLE SAVINGS"
            big="+ $6.40"
            note="Pair with oat milk + sourdough at ALDI for max stack."
            color="var(--cobalt)"
            inv
          />
        </div>
      </div>
    </div>
  );
}

function FootCard({ label, big, note, color, inv }) {
  return (
    <div style={{
      background: inv ? color : 'var(--paper)',
      color: inv ? 'var(--cream)' : 'var(--ink)',
      border: '1.5px solid var(--ink)',
      borderRadius: 'var(--r-md)',
      padding: '18px 20px',
      boxShadow: '4px 4px 0 var(--ink)',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em',
        color: inv ? 'rgba(247,242,231,0.7)' : 'var(--ink-70)',
      }}>{label}</div>
      <div className="bignum" style={{
        fontSize: 30, marginTop: 8,
        color: inv ? 'var(--cream)' : color === 'var(--lime)' ? 'var(--ink)' : color,
      }}>{big}</div>
      <div style={{ fontSize: 12, marginTop: 8, lineHeight: 1.4, opacity: 0.85 }}>{note}</div>
    </div>
  );
}

window.ComparisonPage = ComparisonPage;
