import { DollarSign, Package, Users, ShoppingCart, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const STATS = [
  { label: 'Products Tracked', value: '45,218', change: '+312 this week', icon: Package, color: 'bg-blue-50 text-blue-600', href: '/admin/products' },
  { label: 'Price Snapshots', value: '1.2M', change: '+18k today', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', href: '/admin/prices' },
  { label: 'Active Specials', value: '2,847', change: '891 true specials', icon: TrendingDown, color: 'bg-orange-50 text-orange-600', href: '/admin/prices' },
  { label: 'Waitlist Signups', value: '1,284', change: '+47 this week', icon: Users, color: 'bg-purple-50 text-purple-600', href: '/admin/waitlist' },
];

const RECENT_ACTIVITY = [
  { time: '2 min ago', action: 'Coles scraper completed', detail: '12,480 prices updated' },
  { time: '15 min ago', action: 'Woolworths scraper completed', detail: '14,220 prices updated' },
  { time: '1 hr ago', action: 'New waitlist signup', detail: 'sarah.chen@gmail.com' },
  { time: '2 hr ago', action: 'Price anomaly detected', detail: 'Cadbury Dairy Milk dropped 68% at Woolworths' },
  { time: '4 hr ago', action: 'ALDI catalogue imported', detail: '287 new specials for this week' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of SmartShopper data pipeline</p>
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
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.change}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">{item.time}</span>
                <div>
                  <div className="font-medium text-gray-700">{item.action}</div>
                  <div className="text-gray-400 text-xs">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Scraper Status</h2>
          <div className="space-y-3">
            {[
              { name: 'Coles', status: 'healthy', lastRun: '2 min ago', products: '12,480' },
              { name: 'Woolworths', status: 'healthy', lastRun: '15 min ago', products: '14,220' },
              { name: 'ALDI', status: 'healthy', lastRun: '4 hr ago', products: '1,842' },
              { name: 'IGA', status: 'warning', lastRun: '18 hr ago', products: '16,676' },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      s.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span className="font-medium text-gray-700">{s.name}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {s.products} products · {s.lastRun}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
