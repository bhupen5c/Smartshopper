'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/shop', label: 'Compare' },
  { href: '/shop/list', label: 'List' },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="ss-nav sticky top-0">
      <Link href="/" className="ss-nav__logo">
        <span className="dot" />
        <span>
          SMARTSHOPPER<span style={{ color: 'var(--tomato)' }}>.</span>
        </span>
      </Link>

      <nav className="ss-nav__links hidden md:flex">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive =
            href === '/shop'
              ? pathname?.startsWith('/shop') ?? false
              : pathname === href;
          return (
            <Link key={href} href={href} className={isActive ? 'active' : ''}>
              {label}
            </Link>
          );
        })}
      </nav>

      <Link href="/shop" className="ss-nav__cta">
        Start saving <span className="arrow">→</span>
      </Link>
    </header>
  );
}
