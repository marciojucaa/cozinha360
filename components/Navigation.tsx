
import React from 'react';
import { User } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  role: User['role'];
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, role }) => {
  const tabs = [
    { id: 'menu', label: 'Cardápio', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', roles: ['waiter', 'admin', 'cashier', 'kitchen'] },
    { id: 'tables', label: 'Mesas', icon: 'M4 6h16M4 12h16m-7 6h7', roles: ['waiter', 'admin'] },
    { id: 'delivery', label: 'Delivery', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['waiter', 'admin', 'cashier'] },
    { id: 'kitchen', label: 'Cozinha', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', roles: ['kitchen', 'admin'] },
    { id: 'cashier', label: 'Caixa', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', roles: ['cashier', 'admin'] },
    { id: 'reports', label: 'Relatórios', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['admin'] },
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around md:relative md:border-t-0 md:bg-transparent md:max-w-7xl md:mx-auto md:px-6 md:pt-4 z-40 overflow-x-auto">
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center py-3 px-4 flex-1 min-w-[70px] md:flex-none md:rounded-xl transition-all ${
            activeTab === tab.id 
              ? 'text-indigo-600 md:bg-indigo-600 md:text-white' 
              : 'text-slate-400 hover:text-slate-600 md:hover:bg-slate-100'
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
          </svg>
          <span className="text-[10px] uppercase font-bold tracking-wider">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};
