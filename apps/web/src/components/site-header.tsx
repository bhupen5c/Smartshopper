import Link from 'next/link';
import { ShoppingBasket } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShoppingBasket className="size-4" aria-hidden />
          </span>
          <span className="tracking-tight">SmartShopper</span>
          <Badge variant="muted" className="hidden sm:inline-flex">
            AU preview
          </Badge>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="#specials" className="text-muted-foreground transition-colors hover:text-foreground">
            Specials
          </Link>
          <Link href="#pattern" className="text-muted-foreground transition-colors hover:text-foreground">
            Pattern analysis
          </Link>
          <Link href="#basket" className="text-muted-foreground transition-colors hover:text-foreground">
            Basket plans
          </Link>
          <Link href="#delivery" className="text-muted-foreground transition-colors hover:text-foreground">
            Delivery vs pickup
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="#waitlist">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="#waitlist">Join the waitlist</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
