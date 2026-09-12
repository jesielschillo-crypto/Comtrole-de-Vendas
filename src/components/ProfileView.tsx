import React, { useState } from 'react';
import { StoreProfile, Client, Sale, Product } from '../types';
import { StorageManager, ADMIN_WHATSAPP, ADMIN_WHATSAPP_DISPLAY } from '../lib/storage';

interface ProfileViewProps {
  profile: StoreProfile;
  clients: Client[];
  sales: Sale[];
  products: Product[];
  onOpenEditModal: () => void;
  onLockTerminal: () => void;
  onSyncSupabase?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  clients,
  sales,
  products,
  onOpenEditModal,
  onLockTerminal,
}) => {
  const [copiedHwid, setCopiedHwid] = useState<boolean>(false);
  const deviceHwid = StorageManager.getDeviceHwid();

  const handleCopyHwid = () => {
    navigator.clipboard.writeText(deviceHwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ profile, clients, sales, products }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup-pccraft-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4 pb-28 pt-16 px-4 max-w-md mx-auto w-full">
      {/* CARD 1: PERFIL BÁSICO (Simples e Direto) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white">
                Ativo
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{profile.fullName}</h2>
              <p className="text-xs text-[#034c70] font-semibold">{profile.role}</p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px] text-slate-400">store</span>
                {profile.storeBranch}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenEditModal}
            className="p-2 text-slate-400 hover:text-[#034c70] rounded-xl hover:bg-slate-50 transition-colors"
            title="Editar Perfil"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
        </div>

        {/* Informações Básicas de Contato e Chave Pix */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">phone_android</span>
              WhatsApp
            </span>
            <span className="font-semibold text-slate-800">{profile.whatsappContact || ADMIN_WHATSAPP_DISPLAY}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#00658c]">mail</span>
              E-mail
            </span>
            <span className="font-semibold text-slate-800 truncate max-w-[180px]">{profile.corporateEmail}</span>
          </div>
        </div>

        <button
          onClick={onOpenEditModal}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#034c70] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          <span>Editar Informações do Perfil</span>
        </button>
      </div>

      {/* CARD 2: LICENÇA E PROTEÇÃO DO APARELHO (Anti-Repasse) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#034c70] text-[20px]">verified</span>
            <span className="text-xs font-bold text-slate-900">Licença do Computador</span>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
            Ativa neste Aparelho
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Hardware ID:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                {deviceHwid}
              </span>
              <button
                onClick={handleCopyHwid}
                className="text-xs text-[#00658c] hover:underline font-semibold"
                title="Copiar ID"
              >
                {copiedHwid ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            🔒 Licença individual e intransferível vinculada a este computador. O repasse da chave para outros computadores é bloqueado automaticamente.
          </p>
        </div>
      </div>

      {/* CARD 3: AÇÕES ESSENCIAIS */}
      <div className="space-y-2 pt-1">
        {/* Exportar Backup */}
        <button
          onClick={handleExportBackup}
          className="w-full p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-left text-xs transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00658c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </div>
            <div>
              <p className="font-bold text-slate-900">Fazer Backup dos Dados</p>
              <p className="text-[10px] text-slate-500">Baixar arquivo JSON com vendas e clientes</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
        </button>

        {/* Suporte WhatsApp */}
        <a
          href={`https://wa.me/55${ADMIN_WHATSAPP}?text=${encodeURIComponent(
            `Olá Jesiel, preciso de suporte no sistema PC Craft Hardware (Hardware ID: ${deviceHwid}).`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="w-full p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-left text-xs transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </div>
            <div>
              <p className="font-bold text-slate-900">Suporte no WhatsApp</p>
              <p className="text-[10px] text-slate-500">Falar com Jesiel ({ADMIN_WHATSAPP_DISPLAY})</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
        </a>

        {/* Bloquear Terminal */}
        <button
          onClick={onLockTerminal}
          className="w-full p-3 bg-rose-50 hover:bg-rose-100/70 text-rose-700 rounded-xl border border-rose-200 flex items-center justify-center gap-2 text-xs font-bold transition-colors mt-2"
        >
          <span className="material-symbols-outlined text-[18px]">lock</span>
          <span>Bloquear Terminal / Sair</span>
        </button>
      </div>
    </div>
  );
};
