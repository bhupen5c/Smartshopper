import { Basket } from '@/components/sections/basket';
import { Delivery } from '@/components/sections/delivery';
import { Hero } from '@/components/sections/hero';
import { Pattern } from '@/components/sections/pattern';
import { Specials } from '@/components/sections/specials';
import { Waitlist } from '@/components/sections/waitlist';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Specials />
        <Pattern />
        <Basket />
        <Delivery />
        <Waitlist />
      </main>
      <SiteFooter />
    </>
  );
}
