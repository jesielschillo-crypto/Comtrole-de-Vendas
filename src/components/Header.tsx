import React from 'react';
import { StoreProfile } from '../types';

interface HeaderProps {
  profile: StoreProfile;
  currentTab: string;
  onOpenProfile: () => void;
  onLockTerminal: () => void;
  onOpenAdminPanel: () => void;
  pendingRequestsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentTab,
  onOpenProfile,
  onLockTerminal,
  onOpenAdminPanel,
  pendingRequestsCount,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'inicio':
        return { title: 'PC Craft Hardware', subtitle: 'PAINEL DE VENDAS' };
      case 'nova-venda':
        return { title: 'PC Craft', subtitle: 'REGISTRAR VENDA & PARCELAMENTO' };
      case 'clientes':
        return { title: 'PC Craft', subtitle: 'CLIENTES & PARCELAS' };
      case 'perfil':
        return { title: 'PC Craft Hardware', subtitle: 'PERFIL' };
      default:
        return { title: 'PC Craft Hardware', subtitle: 'CONTROLE DE VENDAS' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-[#034c70] flex items-center justify-center text-[#5dc6ff] shadow-sm shrink-0">
          <span className="material-symbols-outlined text-[22px]">memory</span>
        </div>
        <div className="leading-tight min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
            {title}
          </h1>
          <p className="text-[10px] sm:text-[11px] text-[#00658c] font-bold tracking-wider uppercase truncate">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Status Supabase Cloud */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff4ff] border border-blue-100 text-[#00658c]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-bold">Nuvem OK</span>
        </div>

        {/* Botão ADM / Solicitações pendentes */}
        <button
          onClick={onOpenAdminPanel}
          title="Painel de Solicitações de Acesso ADM"
          className="relative p-2 text-slate-600 hover:text-[#034c70] hover:bg-slate-100 rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute 0 top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* Notificações / Sino */}
        <button
          onClick={onLockTerminal}
          title="Bloquear Terminal / Trocar Usuário"
          className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">lock</span>
        </button>

        {/* Avatar do Usuário */}
        <button
          onClick={onOpenProfile}
          className="relative active:scale-95 transition-transform"
          title="Ver Perfil"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#00658c]/40 shadow-xs bg-slate-100">
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </header>
  );
};
