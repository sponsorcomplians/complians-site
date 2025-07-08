'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, AlertCircle, Settings } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: AlertCircle },
    { href: '/workers', label: 'Workers', icon: Users },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/complians-hr', label: 'Complians HR', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-black text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">HR Compliance</h1>
        <p className="text-sm text-gray-400">Sponsor Licence Management</p>
      </div>
      
      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div className="mt-8 p-4 bg-red-600 rounded-lg">
        <p className="text-sm font-semibold">Compliance Alerts</p>
        <p className="text-xs mt-1">3 critical issues require attention</p>
      </div>
    </nav>
  );
}