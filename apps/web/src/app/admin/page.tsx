import { DollarSign, Package, Users, ShoppingCart, TrendingDown, Database, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const STATS = [
  { label: 'Products Tracked', value: '0', change: 'No database connected', icon: Package, color: 'bg-blue-50 text-blue-600', href: '/admin/products' },
  { label: 'Price Snapshots', value: '0', change: 'No scrapers running', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', href: '/admin/prices' },
  { label: 'Active Specials', value: '0', change: 'Awaiting first scrape', icon: TrendingDown, color: 'bg-orange-50 text-orange-600', href: '/admin/prices' },
  { label: 'Waitlist Signups', value: '0', change: 'No signups yet', icon: Users, color: 'bg-purple-50 text-purple-600', href: '/admin/waitlist' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of SmartShopper data pipeline</p>
      </div>

      {/* Setup banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-amber-800">Setup required</h3>
          <p className="text-sm text-amber-700 mt-1">
            No database or scrapers are connected yet. The admin panel will show real data once the pipeline is configured.
            The consumer shopping flow at <Link href="/shop" className="underline font-medium">/shop</Link> uses a static demo catalogue in the meantime.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
              <Database className="h-3 w-3" /> Database — not connected
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
              Coles scraper — not configured
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
              Woolworths scraper — not configured
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
              ALDI scraper — not configured
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
              IGA scraper — not configured
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-300">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.change}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="py-8 text-center text-gray-400">
            <Database className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs mt-1">Events will appear here once scrapers and the database are connected.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Scraper Status</h2>
          <div className="space-y-3">
            {[
              { name: 'Coles', status: 'offline' },
              { name: 'Woolworths', status: 'offline' },
              { name: 'ALDI', status: 'offline' },
              { name: 'IGA', status: 'offline' },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-300" />
                  <span className="font-medium text-gray-700">{s.name}</span>
                </div>
                <span className="text-xs text-gray-400">Not configured</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
