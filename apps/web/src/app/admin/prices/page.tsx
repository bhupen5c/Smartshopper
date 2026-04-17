import { DEMO_PRODUCTS } from '@/lib/demo-data';
import { formatAUD } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus, Search, Filter } from 'lucide-react';

export const metadata = { title: 'Price Management' };

function PriceTrend({ current, baseline }: { current: number; baseline: number }) {
  const diff = ((current - baseline) / baseline) * 100;
  if (Math.abs(diff) < 2) return <span className="text-gray-400 flex items-center gap-1 text-xs"><Minus className="h-3 w-3" /> Stable</span>;
  if (diff < 0)
    return (
      <span className="text-emerald-600 flex items-center gap-1 text-xs">
        <TrendingDown className="h-3 w-3" /> {Math.abs(diff).toFixed(0)}% below baseline
      </span>
    );
  return (
    <span className="text-red-500 flex items-center gap-1 text-xs">
      <TrendingUp className="h-3 w-3" /> {diff.toFixed(0)}% above baseline
    </span>
  );
}

export default function PricesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Management</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage scraped price data across all retailers</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Retailer</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Current</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Baseline (90d)</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Low (90d)</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Trend</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Cycle</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">True Special?</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Sparkline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {DEMO_PRODUCTS.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.size} · {p.category}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.retailer}</td>
                <td className="px-4 py-3 text-right font-mono font-medium text-gray-900">
                  {formatAUD(p.currentPrice)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-500">
                  {formatAUD(p.baseline)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-emerald-600">
                  {formatAUD(p.low90d)}
                </td>
                <td className="px-4 py-3">
                  <PriceTrend current={p.currentPrice} baseline={p.baseline} />
                </td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {p.cycleDays > 0 ? `${p.cycleDays}d` : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  {p.isTrueSpecial ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      No
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-end gap-px h-6">
                    {p.history.slice(-20).map((v, i) => {
                      const max = Math.max(...p.history.slice(-20));
                      const min = Math.min(...p.history.slice(-20));
                      const range = max - min || 1;
                      const h = 4 + ((v - min) / range) * 20;
                      return (
                        <div
                          key={i}
                          className={`w-1 rounded-sm ${v <= p.low90d ? 'bg-emerald-400' : 'bg-gray-300'}`}
                          style={{ height: `${h}px` }}
                        />
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
