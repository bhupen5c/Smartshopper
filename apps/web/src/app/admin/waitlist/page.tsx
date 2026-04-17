import { Users, Database } from 'lucide-react';

export const metadata = { title: 'Waitlist' };

export default function WaitlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Waitlist</h1>
        <p className="text-sm text-gray-500 mt-1">User signups from the landing page</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-400">No signups yet</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Waitlist signups will appear here once the landing page form is connected
          to a database. Currently the form is UI-only.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Database className="h-3.5 w-3.5" />
          Requires: PostgreSQL + API endpoint for /api/waitlist
        </div>
      </div>
    </div>
  );
}
