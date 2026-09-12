import React, { useState } from 'react';
import { StoreProfile } from '../types';
import { AvatarSelector } from './AvatarSelector';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StoreProfile;
  onSaveProfile: (profile: StoreProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [fullName, setFullName] = useState<string>(profile.fullName);
  const [role, setRole] = useState<string>(profile.role);
  const [storeBranch, setStoreBranch] = useState<string>(profile.storeBranch);
  const [corporateEmail, setCorporateEmail] = useState<string>(profile.corporateEmail);
  const [whatsappContact, setWhatsappContact] = useState<string>(profile.whatsappContact);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatarUrl);

  // Password reset fields
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailResetSent, setEmailResetSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      fullName,
      role,
      storeBranch,
      corporateEmail,
      whatsappContact,
      avatarUrl,
    });
    onClose();
  };

  const handleSendResetEmail = () => {
    setEmailResetSent(true);
    setTimeout(() => setEmailResetSent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#f8f9ff] text-[#0b1c30] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top App Bar Customizado */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl text-[#00344f] hover:bg-slate-100 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Editar Perfil</h2>
              <p className="text-[11px] text-[#00658c] font-semibold">PC Craft Hardware</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[#00658c] text-[11px] font-bold border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
          </div>
        </div>

        {/* Main Form Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Avatar Section */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center relative overflow-hidden">
            <AvatarSelector
              currentAvatarUrl={avatarUrl}
              onAvatarChange={setAvatarUrl}
              userName={fullName}
            />

            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900">{fullName}</h3>
              <p className="text-xs text-slate-500 font-medium">ID Técnico: {profile.technicianId} • Matriz</p>
            </div>

            <p className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
              Escolha uma imagem do celular ou computador. A foto é opcional.
            </p>
          </section>

          {/* Dados Profissionais */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#034c70] text-[18px]">badge</span>
                <h4 className="text-xs uppercase font-bold text-slate-900">Dados Profissionais</h4>
              </div>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-[#00658c] font-bold">Identificação</span>
            </div>

            {/* Nome Completo */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase font-bold text-slate-700">
                Nome Completo <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-3 pl-9 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00658c]"
                />
                <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                  person
                </span>
              </div>
            </div>

            {/* Cargo */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase font-bold text-slate-700">
                Cargo / Função na Loja <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-11 px-3 pl-9 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00658c]"
                />
                <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                  build
                </span>
              </div>
            </div>

            {/* Unidade */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase font-bold text-slate-700">
                Unidade / Loja <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={storeBranch}
                  onChange={(e) => setStoreBranch(e.target.value)}
                  className="w-full h-11 px-3 pl-9 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00658c]"
                />
                <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                  storefront
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase font-bold text-slate-700">
                E-mail Corporativo <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={corporateEmail}
                  onChange={(e) => setCorporateEmail(e.target.value)}
                  className="w-full h-11 px-3 pl-9 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00658c]"
                />
                <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                  alternate_email
                </span>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase font-bold text-slate-700">
                WhatsApp / Telefone Comercial <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  required
                  value={whatsappContact}
                  onChange={(e) => setWhatsappContact(e.target.value)}
                  className="w-full h-11 px-3 pl-9 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00658c]"
                />
                <span className="material-symbols-outlined absolute left-2.5 text-emerald-600 text-[18px] pointer-events-none">
                  chat
                </span>
              </div>
            </div>
          </section>

          {/* Seção Segurança & Senha (HTML Imagem 5) */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs border-l-4 border-l-[#00658c] space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#00658c]">security</span>
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-900">Segurança da Conta &amp; Senha</h4>
                <p className="text-[10px] text-slate-500">Credenciais e autenticação de vendedor</p>
              </div>
            </div>

            {/* Redefinição Rápida */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#034c70] text-lg mt-0.5">mark_email_read</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">Redefinição Rápida por E-mail</p>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Enviaremos um link seguro para o seu e-mail cadastrado ({corporateEmail}) para redefinir a senha.
                  </p>
                </div>
              </div>

              {emailResetSent ? (
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold text-center border border-emerald-200">
                  Link de redefinição enviado com sucesso para {corporateEmail}!
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-[#00344f] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <span className="material-symbols-outlined text-xs">send</span>
                  <span>Enviar Link de Redefinição de Senha</span>
                </button>
              )}
            </div>

            {/* Alteração Manual */}
            <div className="pt-1 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Ou altere diretamente abaixo
              </span>

              <div className="space-y-1">
                <label className="block text-[11px] uppercase font-bold text-slate-700">Nova Senha Master</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 8 caracteres e símbolos"
                    className="w-full h-11 px-3 pl-9 pr-9 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00658c]"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                    lock
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] uppercase font-bold text-slate-700">Confirmar Nova Senha</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full h-11 px-3 pl-9 pr-9 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00658c]"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px] pointer-events-none">
                    lock_reset
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newPassword || newPassword.length < 6) {
                    alert('A senha deve ter no mínimo 6 caracteres.');
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    alert('As senhas digitadas não coincidem.');
                    return;
                  }
                  alert('Senha master atualizada com sucesso!');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="w-full h-10 rounded-xl bg-slate-100 text-[#00658c] text-xs font-bold hover:bg-slate-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">key</span>
                <span>Atualizar Senha</span>
              </button>
            </div>
          </section>

          {/* Botões de Ação Principal */}
          <section className="space-y-2 pt-1">
            <button
              type="submit"
              className="w-full h-12 bg-[#034c70] hover:bg-[#00344f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[19px]">save</span>
              <span>Salvar Alterações do Perfil</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-400">close</span>
              <span>Cancelar / Descartar</span>
            </button>
          </section>
        </form>
      </div>
    </div>
  );
};
