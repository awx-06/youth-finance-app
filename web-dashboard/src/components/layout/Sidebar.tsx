import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Children', href: '/children', icon: '👶' },
  { name: 'Transactions', href: '/transactions', icon: '💳' },
  { name: 'Allowances', href: '/allowances', icon: '💰' },
  { name: 'Savings Goals', href: '/savings-goals', icon: '🎯' },
  { name: 'Notifications', href: '/notifications', icon: '🔔' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white shadow-md hidden lg:block">
      <nav className="px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
