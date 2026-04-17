'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  LogOut,
} from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/prices', label: 'Prices', icon: DollarSign },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/waitlist', label: 'Waitlist', icon: Users },
  { href: '/admin/optimizer', label: 'Basket Optimizer', icon: ShoppingCart },
];

export function AdminSidebar({ user }: { user?: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-5 border-b border-gray-200">
        <Link href="/admin" className="text-lg font-bold text-emerald-600">
          SmartShopper
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-700 truncate">{user?.name ?? 'Admin'}</div>
        <div className="text-xs text-gray-400 truncate">{user?.email}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-3 flex items-center gap-2 text-xs text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
