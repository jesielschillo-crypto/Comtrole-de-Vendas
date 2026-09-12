import React from 'react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView } = useApp();

  const isTabActive = (tab: 'dashboard' | 'inventory' | 'sales' | 'clients' | 'profile') => {
    if (tab === 'dashboard') return currentView === 'dashboard';
    if (tab === 'inventory') return currentView === 'inventory' || currentView === 'new_item';
    if (tab === 'sales') return currentView === 'new_sale' || currentView === 'receipt';
    if (tab === 'clients') return currentView === 'clients';
    if (tab === 'profile') return currentView === 'profile';
    return false;
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Início',
      icon: 'dashboard',
      action: () => setCurrentView('dashboard'),
      active: isTabActive('dashboard'),
    },
    {
      id: 'inventory',
      label: 'Estoque',
      icon: 'desktop_windows',
      action: () => setCurrentView('inventory'),
      active: isTabActive('inventory'),
    },
    {
      id: 'sales',
      label: 'Venda',
      icon: 'point_of_sale',
      action: () => setCurrentView('new_sale'),
      active: isTabActive('sales'),
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: 'group',
      action: () => setCurrentView('clients'),
      active: isTabActive('clients'),
    },
    {
      id: 'profile',
      label: 'Perfil ADM',
      icon: 'account_circle',
      action: () => setCurrentView('profile'),
      active: isTabActive('profile'),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] shadow-lg no-print">
      <div className="flex justify-around items-center h-16 max-w-4xl mx-auto px-1">
        {navItems.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={item.action}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[58px] h-12 transition-colors active:scale-95 ${
              item.active
                ? 'text-[#006194] font-bold'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[23px]"
              style={{
                fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span className="font-body text-[10px] leading-none truncate max-w-[65px]">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};
