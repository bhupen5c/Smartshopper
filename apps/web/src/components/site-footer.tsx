import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t-[1.5px] border-ink bg-ink text-cream">
      <div className="container flex flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between md:px-10">
        <div className="max-w-md">
          <div className="ss-nav__logo" style={{ color: 'var(--cream)' }}>
            <span className="dot" />
            <span>
              SMARTSHOPPER<span style={{ color: 'var(--tomato)' }}>.</span>
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-cream/70">
            An independent price tracker for Australian supermarkets and convenience stores.
            Store locations come from OpenStreetMap. Not affiliated with Coles, Woolworths, ALDI,
            IGA or any retailer named on this site.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-[12px] font-medium uppercase tracking-[0.04em]">
          <Link href="/about" className="text-cream/70 hover:text-lime">
            About
          </Link>
          <Link href="/privacy" className="text-cream/70 hover:text-lime">
            Privacy
          </Link>
          <Link href="/terms" className="text-cream/70 hover:text-lime">
            Terms
          </Link>
          <a
            href="https://github.com/bhupen5c/Smartshopper"
            target="_blank"
            rel="noreferrer"
            className="text-cream/70 hover:text-lime"
          >
            GitHub
          </a>
        </div>
      </div>
      <div className="border-t border-cream/15">
        <div className="container flex items-center justify-between px-6 py-3 font-mono text-[11px] tracking-wider text-cream/60 md:px-10">
          <span>◉ DATA FROM OPENSTREETMAP · UPDATED EVERY 24H</span>
          <span>© 2026 SMARTSHOPPER</span>
        </div>
      </div>
    </footer>
  );
}
