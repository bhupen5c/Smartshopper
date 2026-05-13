import { DollarSign, Database, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { readClient } from '@/lib/supabase/client';

export const metadata = { title: 'Price Management' };
export const dynamic = 'force-dynamic';

interface RunRow {
  id: number;
  retailer_code: string;
  kind: string;
  started_at: string;
  finished_at: string | null;
  items_emitted: number;
  errors_count: number;
  ok: boolean | null;
  notes: string | null;
}

interface PerRetailerRow {
  retailer_code: string;
  display_name: string;
  prices_count: number;
  latest_scraped_at: string | null;
}

async function loadDashboard(): Promise<{
  recentRuns: RunRow[];
  perRetailer: PerRetailerRow[];
  totals: { runs: number; prices: number; retailers: number };
}> {
  const supabase = readClient();
  if (!supabase) {
    return { recentRuns: [], perRetailer: [], totals: { runs: 0, prices: 0, retailers: 0 } };
  }

  const [runsRes, retailersRes, latestRes, totalRunsRes, totalPricesRes] = await Promise.all([
    supabase
      .from('scrape_runs')
      .select('id, retailer_code, kind, started_at, finished_at, items_emitted, errors_count, ok, notes')
      .order('started_at', { ascending: false })
      .limit(20),
    supabase.from('retailers').select('code, display_name').eq('is_active', true),
    supabase.from('latest_prices').select('retailer_code, scraped_at'),
    supabase.from('scrape_runs').select('id', { count: 'exact', head: true }),
    supabase.from('prices').select('id', { count: 'exact', head: true }),
  ]);

  const recentRuns = (runsRes.data ?? []) as RunRow[];
  const retailers = (retailersRes.data ?? []) as Array<{ code: string; display_name: string }>;
  const latest = (latestRes.data ?? []) as Array<{ retailer_code: string | null; scraped_at: string | null }>;

  // Aggregate per-retailer: how many distinct products + most recent scrape.
  const perRetailerMap = new Map<string, PerRetailerRow>();
  for (const r of retailers) {
    perRetailerMap.set(r.code, {
      retailer_code: r.code,
      display_name: r.display_name,
      prices_count: 0,
      latest_scraped_at: null,
    });
  }
  for (const row of latest) {
    if (!row.retailer_code) continue;
    const entry = perRetailerMap.get(row.retailer_code);
    if (!entry) continue;
    entry.prices_count += 1;
    if (!entry.latest_scraped_at || (row.scraped_at && row.scraped_at > entry.latest_scraped_at)) {
      entry.latest_scraped_at = row.scraped_at;
    }
  }

  return {
    recentRuns,
    perRetailer: Array.from(perRetailerMap.values())
      .filter((r) => r.prices_count > 0)
      .sort((a, b) => b.prices_count - a.prices_count),
    totals: {
      runs: totalRunsRes.count ?? 0,
      prices: totalPricesRes.count ?? 0,
      retailers: retailers.length,
    },
  };
}

function formatAgo(iso: string | null): string {
  if (!iso) return 'never';
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default async function PricesPage() {
  const { recentRuns, perRetailer, totals } = await loadDashboard();

  if (totals.prices === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            View scraped prices + cron run history.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-400">No prices in Supabase yet</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Add SUPABASE_SERVICE_ROLE_KEY + GEMINI_API_KEY to Vercel env, then
            either wait for the nightly cron or trigger it manually via{' '}
            <code className="font-mono">curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/scrape-prices</code>.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Database className="h-3.5 w-3.5" />
            Reads from public.latest_prices + public.scrape_runs
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Price Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Live data from Supabase · {totals.prices.toLocaleString()} prices ·{' '}
          {totals.runs} scrape runs · {totals.retailers} active retailers
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Per-retailer coverage</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-2">Retailer</th>
                <th className="px-4 py-2 text-right">Products priced</th>
                <th className="px-4 py-2 text-right">Last scrape</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {perRetailer.map((r) => (
                <tr key={r.retailer_code}>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{r.display_name}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{r.prices_count}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">
                    {formatAgo(r.latest_scraped_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent scrape runs</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-2 w-8"></th>
                <th className="px-4 py-2">Retailer</th>
                <th className="px-4 py-2">Kind</th>
                <th className="px-4 py-2">Started</th>
                <th className="px-4 py-2 text-right">Items</th>
                <th className="px-4 py-2 text-right">Errors</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentRuns.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">
                    {r.ok === true ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : r.ok === false ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-300" />
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-900">{r.retailer_code}</td>
                  <td className="px-4 py-2 text-gray-500">{r.kind}</td>
                  <td className="px-4 py-2 text-gray-500">{formatAgo(r.started_at)}</td>
                  <td className="px-4 py-2 text-right font-mono">{r.items_emitted}</td>
                  <td className="px-4 py-2 text-right font-mono text-gray-500">{r.errors_count || ''}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 max-w-[260px] truncate">
                    {r.notes ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
