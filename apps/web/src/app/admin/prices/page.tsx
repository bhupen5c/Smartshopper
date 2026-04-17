import { DollarSign, Database } from 'lucide-react';

export const metadata = { title: 'Price Management' };

export default function PricesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Price Management</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage scraped price data across all retailers</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-400">No price data yet</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Price snapshots will appear here once the scrapers are connected to a database
          and running. Each scrape captures the current price, was-price, unit price,
          and stock status for every product at each retailer.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Database className="h-3.5 w-3.5" />
          Requires: PostgreSQL + scraper pipeline
        </div>
      </div>
    </div>
  );
}
