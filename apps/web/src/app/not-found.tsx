import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">404 · Not found</p>
        <h1 className="font-display text-4xl font-semibold">We could not find that page</h1>
        <p className="max-w-md text-muted-foreground">
          The page you are looking for has moved or does not exist. Try searching the live feed from
          the home page instead.
        </p>
        <Button asChild>
          <Link href="/">Back to the home page</Link>
        </Button>
      </main>
      <SiteFooter />
    </>
  );
}
