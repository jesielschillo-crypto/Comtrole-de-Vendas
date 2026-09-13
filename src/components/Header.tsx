import React from 'react';
import { Lock, ShieldCheck, UserCircle } from 'lucide-react';
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
        return { title: 'VTECH', subtitle: 'PAINEL DE VENDAS' };
      case 'nova-venda':
        return { title: 'VTECH', subtitle: 'REGISTRAR VENDA & PARCELAMENTO' };
      case 'clientes':
        return { title: 'VTECH', subtitle: 'CLIENTES & PARCELAS' };
      case 'estoque':
        return { title: 'VTECH', subtitle: 'ESTOQUE & EQUIPAMENTOS' };
      case 'cadastrar-produto':
        return { title: 'VTECH', subtitle: 'CADASTRAR PEÇA' };
      case 'perfil':
        return { title: 'VTECH', subtitle: 'PERFIL' };
      default:
        return { title: 'VTECH', subtitle: 'CONTROLE DE VENDAS' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 shadow-xs">
      <div className="flex items-center gap-2.5">
        <img src="/vtech-logo.png" alt="VTECH" className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" />
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
          <ShieldCheck size={21} />
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
          <Lock size={20} />
        </button>

        {/* Avatar do Usuário */}
        <button
          onClick={onOpenProfile}
          className="relative active:scale-95 transition-transform"
          title="Ver Perfil"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#00658c]/40 shadow-xs bg-slate-100">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="h-full w-full p-1 text-slate-400" />
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </header>
  );
};
