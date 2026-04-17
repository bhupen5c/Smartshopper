import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container flex flex-col gap-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display font-semibold text-foreground">SmartShopper</p>
          <p className="mt-1 max-w-md text-xs">
            An independent price tracker for Australian supermarkets. Not affiliated with Coles,
            Woolworths, ALDI or IGA. Specials are monitored across public catalogues only; member
            pricing shown is illustrative.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <a
            href="https://github.com/bhupensingh/Smartshopper"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
