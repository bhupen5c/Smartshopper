import { DEMO_PRODUCTS } from '@/lib/demo-data';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export const metadata = { title: 'Product Management' };

const CATEGORIES = ['All', 'Biscuits', 'Chocolate', 'Dairy', 'Breakfast', 'Bakery', 'Pantry', 'Drinks'];

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the product catalogue across all retailers</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
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
        <div className="flex gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                cat === 'All'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_PRODUCTS.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{p.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{p.size} · {p.category}</p>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                p.retailer === 'Coles' ? 'bg-red-50 text-red-600' :
                p.retailer === 'Woolworths' ? 'bg-green-50 text-green-600' :
                p.retailer === 'ALDI' ? 'bg-blue-50 text-blue-600' :
                'bg-orange-50 text-orange-600'
              }`}>
                {p.retailer}
              </span>
              {p.memberOnly && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                  Members Only
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-400">Current</div>
                <div className="font-mono font-semibold text-gray-900 text-sm">${p.currentPrice.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-400">Baseline</div>
                <div className="font-mono text-gray-500 text-sm">${p.baseline.toFixed(2)}</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2">
                <div className="text-xs text-emerald-500">Low 90d</div>
                <div className="font-mono font-semibold text-emerald-700 text-sm">${p.low90d.toFixed(2)}</div>
              </div>
            </div>

            {p.cycleDays > 0 && (
              <div className="mt-3 text-xs text-gray-400">
                Price cycles every <span className="font-medium text-gray-600">{p.cycleDays} days</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
