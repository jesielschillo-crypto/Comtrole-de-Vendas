import React from 'react';

interface NavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingClientsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  pendingClientsCount = 0,
}) => {
  const tabs = [
    { id: 'inicio', label: 'Início', icon: 'grid_view' },
    { id: 'nova-venda', label: 'Nova Venda', icon: 'shopping_cart' },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: 'contacts',
      badge: pendingClientsCount > 0 ? pendingClientsCount : undefined,
    },
    { id: 'perfil', label: 'Perfil', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-16 px-3 bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_12px_rgba(3,76,112,0.08)]">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            type="button"
            className={`flex flex-col items-center justify-center gap-0.5 relative py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 ${
              isActive
                ? 'text-[#00658c] font-bold'
                : 'text-slate-500 hover:text-[#034c70] font-medium'
            }`}
          >
            <div className="relative">
              <span
                className="material-symbols-outlined text-[23px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              {tab.badge && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] leading-tight tracking-tight whitespace-nowrap">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
