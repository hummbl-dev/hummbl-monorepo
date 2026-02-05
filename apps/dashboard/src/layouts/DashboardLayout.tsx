import * as React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '@hummbl/ui';
import {
  LayoutDashboard,
  Clock,
  FileText,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/components/AuthGuard';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Temporal', href: '/temporal', icon: Clock },
  { name: 'Audit Log', href: '/audit', icon: FileText },
  { name: 'Profiles', href: '/profiles', icon: Shield },
  { name: 'Checker', href: '/check', icon: CheckCircle },
];

export const DashboardLayout: React.FC = () => {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-zinc-100">
            Agent Dashboard
          </h1>
          <p className="text-sm text-zinc-500">Governance Control</p>
        </div>

        <nav className="space-y-1 flex-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="pt-4 border-t border-zinc-800">
          <div className="px-3 py-2">
            <p className="text-xs text-zinc-500">Signed in as</p>
            <p className="text-sm text-zinc-300 font-medium">{auth.userId}</p>
            <p className="text-xs text-zinc-500 capitalize">{auth.role} role</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
