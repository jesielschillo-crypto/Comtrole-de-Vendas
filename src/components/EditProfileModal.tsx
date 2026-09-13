import React, { useState } from 'react';
import { Camera, KeyRound, Mail, Save, X } from 'lucide-react';
import { StoreProfile } from '../types';
import { AvatarSelector } from './AvatarSelector';
import { isSupabaseConfigured, sendPasswordResetEmail } from '../lib/supabase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StoreProfile;
  onSaveProfile: (profile: StoreProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profile, onSaveProfile }) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [corporateEmail, setCorporateEmail] = useState(profile.corporateEmail);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [resetMessage, setResetMessage] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSaveProfile({ ...profile, fullName: fullName.trim(), corporateEmail: corporateEmail.trim(), avatarUrl });
    onClose();
  };

  const handleResetPassword = async () => {
    setResetMessage('');
    setIsSendingReset(true);
    const result = await sendPasswordResetEmail(corporateEmail.trim());
    setIsSendingReset(false);
    setResetMessage(result.error ? result.error.message : 'Link enviado. Verifique seu e-mail.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#00658c]">Minha conta</p>
            <h2 className="text-xl font-bold text-slate-900">Editar perfil</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[82vh] space-y-5 overflow-y-auto p-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Camera size={17} className="text-[#00658c]" />
              Foto de perfil
            </div>
            <AvatarSelector currentAvatarUrl={avatarUrl} onAvatarChange={setAvatarUrl} userName={fullName || 'Usuário'} />
          </div>

          <label className="block text-sm font-bold text-slate-700">
            Nome completo
            <input value={fullName} onChange={event => setFullName(event.target.value)} required className="mt-1.5 block h-11 w-full rounded-xl border border-slate-300 px-3 font-normal outline-none focus:border-[#00658c]" />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            E-mail da conta
            <span className="relative mt-1.5 block">
              <Mail size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <input type="email" value={corporateEmail} onChange={event => setCorporateEmail(event.target.value)} required className="block h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 font-normal outline-none focus:border-[#00658c]" />
            </span>
          </label>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <KeyRound size={19} className="mt-0.5 shrink-0 text-[#00658c]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Redefinir senha</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Enviaremos um link seguro para {corporateEmail || 'seu e-mail'}.</p>
              </div>
            </div>
            <button type="button" onClick={handleResetPassword} disabled={isSendingReset || !isSupabaseConfigured()} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              <Mail size={16} />
              {isSendingReset ? 'Enviando...' : 'Enviar link por e-mail'}
            </button>
            {!isSupabaseConfigured() && <p className="mt-2 text-center text-[11px] text-slate-400">Configure o Supabase para ativar esta função.</p>}
            {resetMessage && <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-center text-xs font-semibold text-emerald-700">{resetMessage}</p>}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="h-11 flex-1 rounded-xl border border-slate-300 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#034c70] text-sm font-bold text-white hover:bg-[#00344f]"><Save size={17} />Salvar perfil</button>
          </div>
        </form>
      </div>
    </div>
  );
};
