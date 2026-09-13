import React from 'react';
import { useApp } from '../context/AppContext';
import { CircleUserRound, LayoutDashboard, Monitor, PointOfSale, Users } from 'lucide-react';

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
      icon: LayoutDashboard,
      action: () => setCurrentView('dashboard'),
      active: isTabActive('dashboard'),
    },
    {
      id: 'inventory',
      label: 'Estoque',
      icon: Monitor,
      action: () => setCurrentView('inventory'),
      active: isTabActive('inventory'),
    },
    {
      id: 'sales',
      label: 'Venda',
      icon: PointOfSale,
      action: () => setCurrentView('new_sale'),
      active: isTabActive('sales'),
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      action: () => setCurrentView('clients'),
      active: isTabActive('clients'),
    },
    {
      id: 'profile',
      label: 'Perfil ADM',
      icon: CircleUserRound,
      action: () => setCurrentView('profile'),
      active: isTabActive('profile'),
    },
  ];

  return (
    <nav translate="no" className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] shadow-lg no-print">
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
            <item.icon size={23} strokeWidth={item.active ? 2.6 : 2} aria-hidden="true" />
            <span translate="no" className="font-body text-[10px] leading-none truncate max-w-[65px]">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};
