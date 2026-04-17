import { Download, Mail, Search, UserPlus } from 'lucide-react';

export const metadata = { title: 'Waitlist' };

const DEMO_SIGNUPS = [
  { email: 'sarah.chen@gmail.com', date: '2026-04-17T09:14:00Z', source: 'Landing Page', suburb: 'Bondi, NSW' },
  { email: 'james.m@outlook.com', date: '2026-04-17T07:22:00Z', source: 'Landing Page', suburb: 'Carlton, VIC' },
  { email: 'priya.sharma@yahoo.com', date: '2026-04-16T21:05:00Z', source: 'Referral', suburb: 'Parramatta, NSW' },
  { email: 'michael.nguyen@gmail.com', date: '2026-04-16T18:30:00Z', source: 'Landing Page', suburb: 'Chermside, QLD' },
  { email: 'emma.wilson@icloud.com', date: '2026-04-16T14:11:00Z', source: 'Twitter', suburb: 'Adelaide, SA' },
  { email: 'alex.k@proton.me', date: '2026-04-16T10:45:00Z', source: 'Landing Page', suburb: 'Fremantle, WA' },
  { email: 'lisa.patel@gmail.com', date: '2026-04-15T22:33:00Z', source: 'Product Hunt', suburb: 'Newtown, NSW' },
  { email: 'daniel.brown@gmail.com', date: '2026-04-15T16:18:00Z', source: 'Landing Page', suburb: 'Brunswick, VIC' },
  { email: 'sophie.jones@outlook.com', date: '2026-04-15T12:50:00Z', source: 'Referral', suburb: 'Manly, NSW' },
  { email: 'ryan.lee@gmail.com', date: '2026-04-14T20:07:00Z', source: 'Landing Page', suburb: 'Canberra, ACT' },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function WaitlistPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waitlist</h1>
          <p className="text-sm text-gray-500 mt-1">
            {DEMO_SIGNUPS.length} signups (demo data — wire to DB for live signups)
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Mail className="h-4 w-4" />
            Send Invite Batch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Signups</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">1,284</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">This Week</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">+47</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Top Source</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">Landing</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Top State</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">NSW</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email or suburb..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Suburb</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Source</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Signed Up</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {DEMO_SIGNUPS.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{s.email}</td>
                <td className="px-4 py-3 text-gray-500">{s.suburb}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {s.source}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{timeAgo(s.date)}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                    Waitlisted
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
