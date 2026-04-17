import { ShopProvider } from '@/lib/shop-context';
import { ConsumerHeader } from '@/components/shop/consumer-header';

export const metadata = { title: 'Shop Smart' };

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      <div className="min-h-screen bg-gray-50">
        <ConsumerHeader />
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </div>
    </ShopProvider>
  );
}
