import { Package, Database } from 'lucide-react';

export const metadata = { title: 'Product Management' };

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-1">Manage the product catalogue across all retailers</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-400">No products in database</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Products will be populated automatically when scrapers run their first catalogue import.
          Each product is matched to a canonical GTIN/barcode entry across retailers.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Database className="h-3.5 w-3.5" />
          Requires: PostgreSQL + catalogue scraper
        </div>
      </div>
    </div>
  );
}
