import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, LogOut, Check, UserCheck } from 'lucide-react';
import { cleanUserName } from '../utils/avatarUtils';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    loadDemoData,
    logout,
    currentUser,
    adminName,
    storeName,
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const displayName = cleanUserName(currentUser?.name || adminName || 'Usuário');

  const getSubHeader = () => {
    switch (currentView) {
      case 'dashboard':
        return { title: storeName, sub: 'Painel de Vendas' };
      case 'inventory':
      case 'new_item':
        return { title: storeName, sub: 'PCs & Periféricos' };
      case 'clients':
        return { title: storeName, sub: 'Clientes & WhatsApp' };
      case 'new_sale':
        return { title: storeName, sub: 'Nova Venda' };
      case 'receipt':
        return { title: storeName, sub: 'Comprovante & Carnê' };
      case 'profile':
        return { title: storeName, sub: 'Perfil do Usuário' };
      default:
        return { title: storeName, sub: 'Painel Geral' };
    }
  };

  const headerInfo = getSubHeader();

  const handleLoadDemo = () => {
    loadDemoData();
    setShowProfileMenu(false);
    setToastMessage('Dados de demonstração carregados com sucesso!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const getInitials = (name: string) => {
    const parts = cleanUserName(name).split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] shadow-xs pt-safe">
        <div className="h-16 px-4 sm:px-6 max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-3 min-w-0 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0f172a] group-hover:bg-[#006194] transition-colors flex items-center justify-center p-1.5 shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[#00e5ff] text-[22px]">
                memory
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-headline font-bold text-[15px] sm:text-[16px] text-[#0f172a] truncate tracking-tight leading-tight">
                {headerInfo.title}
              </span>
              <span className="font-body font-bold text-[10px] sm:text-[11px] text-[#006194] uppercase tracking-wider truncate">
                {headerInfo.sub}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (for PC / Widescreen) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-1.5 ${
                currentView === 'dashboard'
                  ? 'bg-[#006194] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              <span>Início</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-1.5 ${
                currentView === 'inventory' || currentView === 'new_item'
                  ? 'bg-[#006194] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
              <span>Estoque & PCs</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('clients')}
              className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-1.5 ${
                currentView === 'clients'
                  ? 'bg-[#006194] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span>Clientes</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('new_sale')}
              className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-1.5 ${
                currentView === 'new_sale'
                  ? 'bg-[#006194] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
              <span>Nova Venda</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('receipt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-1.5 ${
                currentView === 'receipt'
                  ? 'bg-[#006194] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>Comprovante</span>
            </button>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Notification Bell */}
            <button
              aria-label="Notificações"
              onClick={() => {
                setToastMessage('Sistema ativo. Nenhuma notificação urgente.');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="w-9 h-9 flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-xl transition-colors relative"
              type="button"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#006e2d] rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile Badge & Dropdown (Clean, without ADM label) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all focus:outline-none focus:ring-2 focus:ring-[#006194]"
                title="Abrir menu do Usuário"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#006194] text-white flex items-center justify-center text-xs font-bold font-headline shadow-xs relative shrink-0">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(displayName)}</span>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#006e2d] rounded-full ring-2 ring-white"></span>
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#0f172a] max-w-[130px] truncate leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-[#64748b] font-medium truncate">
                    @{currentUser?.username || 'online'}
                  </span>
                </div>

                <span className="hidden sm:block material-symbols-outlined text-[18px] text-[#94a3b8]">
                  expand_more
                </span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-[#f1f5f9]">
                  {/* User info header */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#006194] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {currentUser?.avatarUrl ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{getInitials(displayName)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[#0f172a] truncate">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-[#64748b] truncate">
                          @{currentUser?.username || 'admin'}
                        </p>
                      </div>
                    </div>
                    <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#eff6ff] text-[#006194]">
                      {currentUser?.storeName || 'PC Craft'}
                    </span>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setCurrentView('profile');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs text-[#0f172a] hover:bg-[#eff6ff] flex items-center gap-2.5 font-semibold text-[#006194]"
                    >
                      <UserCheck className="w-4 h-4 text-[#006194]" />
                      <span>Meu Perfil</span>
                    </button>

                    <button
                      onClick={handleLoadDemo}
                      className="w-full px-4 py-2 text-left text-xs text-[#006194] hover:bg-[#eff6ff] flex items-center gap-2.5 font-medium"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#006194]">dataset</span>
                      <span>Carregar exemplos (demo)</span>
                    </button>
                  </div>

                  {/* Red section: ONLY Sair, NO "Zerar Tudo" */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs text-[#ba1a1a] hover:bg-[#fee2e2]/40 flex items-center gap-2.5 font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Floating toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs font-medium max-w-sm text-center animate-in fade-in zoom-in duration-200">
          <Check className="w-4 h-4 text-[#25D366] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
