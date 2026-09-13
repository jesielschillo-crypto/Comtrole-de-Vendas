import React, { useState } from 'react';
import { Camera, Download, LockKeyhole, LogOut, Mail, Pencil, Phone, ShieldCheck } from 'lucide-react';
import { StoreProfile, Client, Sale, Product } from '../types';
import { ADMIN_WHATSAPP, ADMIN_WHATSAPP_DISPLAY } from '../lib/storage';

interface ProfileViewProps {
  profile: StoreProfile;
  clients: Client[];
  sales: Sale[];
  products: Product[];
  onOpenEditModal: () => void;
  onLockTerminal: () => void;
  onSyncSupabase?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, clients, sales, products, onOpenEditModal, onLockTerminal }) => {
  const [copied, setCopied] = useState(false);
  const initials = profile.fullName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(profile.technicianId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleExportBackup = () => {
    const content = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ profile, clients, sales, products }, null, 2))}`;
    const link = document.createElement('a');
    link.href = content;
    link.download = `backup-pccraft-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 px-4 pb-28 pt-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#00658c]">Minha conta</p>
          <h1 className="text-2xl font-bold text-slate-900">Perfil</h1>
        </div>
        <button type="button" onClick={onOpenEditModal} className="flex items-center gap-2 rounded-xl bg-[#034c70] px-3 py-2 text-xs font-bold text-white hover:bg-[#00344f]">
          <Pencil size={15} />Editar
        </button>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#034c70] text-xl font-black text-white ring-4 ring-sky-100">
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" /> : initials}
            <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-900">{profile.fullName}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{profile.role}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><ShieldCheck size={14} /> Conta ativa</p>
          </div>
        </div>

        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm"><Mail size={17} className="shrink-0 text-[#00658c]" /><span className="truncate text-slate-700">{profile.corporateEmail}</span></div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm"><Phone size={17} className="shrink-0 text-emerald-600" /><span className="text-slate-700">{profile.whatsappContact || ADMIN_WHATSAPP_DISPLAY}</span></div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Aparelho atual</h2>
            <p className="mt-1 text-xs text-slate-500">Identificação deste dispositivo</p>
          </div>
          <LockKeyhole size={20} className="text-slate-400" />
        </div>
        <button type="button" onClick={handleCopyId} className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left">
          <span className="font-mono text-xs font-bold text-slate-700">{profile.technicianId}</span>
          <span className="text-xs font-bold text-[#00658c]">{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </section>

      <section className="space-y-2">
        <button type="button" onClick={onOpenEditModal} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"><Camera size={19} className="text-[#00658c]" /><span><strong className="block text-sm text-slate-900">Foto e dados da conta</strong><small className="text-xs text-slate-500">Atualizar nome, e-mail ou foto de perfil</small></span></button>
        <button type="button" onClick={handleExportBackup} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"><Download size={19} className="text-[#00658c]" /><span><strong className="block text-sm text-slate-900">Baixar backup</strong><small className="text-xs text-slate-500">Exportar clientes, vendas e produtos</small></span></button>
        <a href={`https://wa.me/55${ADMIN_WHATSAPP}`} target="_blank" rel="noreferrer" className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"><Phone size={19} className="text-emerald-600" /><span><strong className="block text-sm text-slate-900">Suporte</strong><small className="text-xs text-slate-500">Falar pelo WhatsApp</small></span></a>
        <button type="button" onClick={onLockTerminal} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"><LogOut size={18} />Sair da conta</button>
      </section>
    </div>
  );
};
