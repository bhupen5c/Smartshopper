import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from './sidebar';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar user={session.user} />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
    </div>
  );
}
