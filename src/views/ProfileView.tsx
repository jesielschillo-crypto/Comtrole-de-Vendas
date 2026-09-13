import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AvatarSelector } from '../components/AvatarSelector';
import { cleanUserName } from '../utils/avatarUtils';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    updateAdminProfile,
    logout,
    setCurrentView,
    requirePasswordOnEveryEntry,
    setRequirePasswordOnEveryEntry,
    registeredUsers,
    deleteUserAccount,
  } = useApp();

  const [name, setName] = useState(cleanUserName(currentUser?.name || 'Thiago Almeida'));
  const [storeName, setStoreName] = useState(currentUser?.storeName || 'VTECH');
  const [email, setEmail] = useState(currentUser?.email || 'admin@pccraft.com.br');
  const [username, setUsername] = useState(currentUser?.username || 'admin');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [pixKey, setPixKey] = useState(currentUser?.pixKey || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  // Session preference: require password every time or enter once
  const [passwordPreference, setPasswordPreference] = useState(requirePasswordOnEveryEntry);

  // Password change state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedName = cleanUserName(name.trim());
    if (!cleanedName) {
      showToast('O nome completo é obrigatório.');
      return;
    }

    // If changing password
    if (showPasswordChange && (newPassword || confirmPassword)) {
      if (newPassword.length < 3) {
        setPasswordError('A nova senha deve ter no mínimo 3 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('As senhas digitadas não coincidem.');
        return;
      }
      if (currentUser?.password && currentPasswordInput !== currentUser.password) {
        setPasswordError('Senha atual incorreta.');
        return;
      }
      setPasswordError(null);
    }

    updateAdminProfile({
      name: cleanedName,
      storeName: storeName.trim(),
      email: email.trim(),
      username: username.trim(),
      phone: phone.trim(),
      pixKey: pixKey.trim(),
      avatarUrl: avatarUrl,
      ...(showPasswordChange && newPassword ? { password: newPassword } : {}),
    });

    setRequirePasswordOnEveryEntry(passwordPreference);

    if (showPasswordChange && newPassword) {
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
    }

    showToast('Perfil atualizado com sucesso!');
  };

  const getInitials = (text: string) => {
    const parts = cleanUserName(text).split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-28 md:pb-16 max-w-4xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#006194] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="p-2 rounded-xl bg-white border border-[#cbd5e1] text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc] transition-colors"
            title="Voltar ao Painel"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline text-2xl font-bold text-[#0f172a] tracking-tight">
              Perfil do Usuário
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b]">
              Gerencie seus dados, foto de perfil e preferências de acesso
            </p>
          </div>
        </div>

        {/* Action Header: ONLY Sair da Conta (Red) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2.5 rounded-xl border border-[#ba1a1a]/30 bg-[#fee2e2]/50 hover:bg-[#fee2e2] text-[#ba1a1a] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card (Clean, no ADM suffix) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#006194] text-white flex items-center justify-center text-2xl font-bold font-headline shadow-md shadow-[#006194]/20 shrink-0 border-2 border-white ring-2 ring-[#006194]/20">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{getInitials(name || 'Usuário')}</span>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="font-headline text-xl font-bold text-[#0f172a]">
              {cleanUserName(name) || 'Nome do Usuário'}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eff6ff] text-[#006194] border border-[#bfdbfe] w-fit mx-auto sm:mx-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006194] mr-1.5"></span>
              Conta Ativa
            </span>
          </div>
          <p className="text-sm font-medium text-[#475569]">
            {storeName || 'VTECH'} • @{username}
          </p>
          <p className="text-xs text-[#64748b]">
            Compatível com Celular e Computador
          </p>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Photo Avatar Picker Component */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#f1f5f9] pb-3">
            <span className="material-symbols-outlined text-[#006194] text-[22px]">add_a_photo</span>
            <h3 className="font-headline text-base font-bold text-[#0f172a]">
              Foto de Perfil
            </h3>
          </div>
          <p className="text-xs text-[#64748b]">
            Escolha uma foto da sua galeria/PC ou selecione um avatar rápido
          </p>
          <AvatarSelector
            currentAvatarUrl={avatarUrl}
            onAvatarChange={setAvatarUrl}
            userName={name}
          />
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f1f5f9] pb-3">
            <span className="material-symbols-outlined text-[#006194] text-[22px]">person</span>
            <h3 className="font-headline text-base font-bold text-[#0f172a]">
              Dados Pessoais & Acesso
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Thiago Almeida"
                className="w-full h-11 px-3 bg-[#f8fafc] text-[#0f172a] rounded-xl text-sm border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                Nome de Usuário (Login) *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-[#94a3b8] text-[18px]">
                  alternate_email
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Ex: thiago"
                  className="w-full h-11 pl-9 pr-3 bg-[#f8fafc] text-[#0f172a] rounded-xl text-sm border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                Nome da Loja / Bancada
              </label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="Ex: VTECH - Montagem & Periféricos"
                className="w-full h-11 px-3 bg-[#f8fafc] text-[#0f172a] rounded-xl text-sm border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ex: contato@pccraft.com.br"
                className="w-full h-11 px-3 bg-[#f8fafc] text-[#0f172a] rounded-xl text-sm border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                WhatsApp Comercial
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(11) 99876-5432"
                className="w-full h-11 px-3 bg-[#f8fafc] text-[#0f172a] rounded-xl text-sm border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                Chave PIX (Para Carnê & Recibo)
              </label>
              <input
                type="text"
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder="E-mail, CNPJ ou Telefone PIX"
                className="w-full h-11 px-3 bg-[#f8fafc] text-[#0f172a] rounded-xl text-sm border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
              />
            </div>
          </div>
        </div>

        {/* Security & Access Mode Preference (Entrar uma vez só ou Digitar senha toda vez) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f1f5f9] pb-3">
            <span className="material-symbols-outlined text-[#006194] text-[22px]">security</span>
            <h3 className="font-headline text-base font-bold text-[#0f172a]">
              Preferência de Acesso & Senha
            </h3>
          </div>

          <p className="text-xs text-[#64748b]">
            Configure como você prefere acessar o app no celular e no computador:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                !passwordPreference
                  ? 'bg-[#eff6ff] border-[#006194] shadow-xs'
                  : 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-[#f1f5f9]'
              }`}
            >
              <input
                type="radio"
                name="pref-mode"
                checked={!passwordPreference}
                onChange={() => setPasswordPreference(false)}
                className="mt-1 accent-[#006194]"
              />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#0f172a]">
                  Entrar uma vez só (Lembrar neste aparelho)
                </p>
                <p className="text-xs text-[#64748b]">
                  Ao abrir o aplicativo, entra direto no painel sem pedir a senha novamente.
                </p>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                passwordPreference
                  ? 'bg-[#eff6ff] border-[#006194] shadow-xs'
                  : 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-[#f1f5f9]'
              }`}
            >
              <input
                type="radio"
                name="pref-mode"
                checked={passwordPreference}
                onChange={() => setPasswordPreference(true)}
                className="mt-1 accent-[#006194]"
              />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#0f172a]">
                  Digitar a senha toda vez que entrar
                </p>
                <p className="text-xs text-[#64748b]">
                  Exige que você clique no seu usuário e digite a senha sempre que abrir o app.
                </p>
              </div>
            </label>
          </div>

          {/* Change Password Collapsible */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="text-xs text-[#006194] font-bold hover:underline flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">lock_reset</span>
              <span>
                {showPasswordChange ? 'Ocultar troca de senha' : 'Deseja alterar a senha de acesso?'}
              </span>
            </button>
          </div>

          {showPasswordChange && (
            <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-3 mt-2">
              {passwordError && (
                <p className="text-xs text-[#ba1a1a] bg-[#fee2e2] p-2 rounded-lg font-semibold">
                  {passwordError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={currentPasswordInput}
                    onChange={e => setCurrentPasswordInput(e.target.value)}
                    placeholder="Digite a senha atual"
                    className="w-full h-11 px-3 bg-white text-[#0f172a] rounded-xl text-sm border border-[#cbd5e1] focus:outline-none focus:border-[#006194]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 3 dígitos"
                    className="w-full h-11 px-3 bg-white text-[#0f172a] rounded-xl text-sm border border-[#cbd5e1] focus:outline-none focus:border-[#006194]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full h-11 px-3 bg-white text-[#0f172a] rounded-xl text-sm border border-[#cbd5e1] focus:outline-none focus:border-[#006194]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 h-12 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-headline text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#006194]/20 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span>Salvar Alterações</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="w-full sm:w-auto px-6 h-12 rounded-xl bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f8fafc] text-sm font-bold transition-colors"
          >
            Voltar ao Painel
          </button>
        </div>
      </form>

      {/* User Accounts Management & Log out section (Keeping only Sair, No "Zerar Tudo") */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#475569] text-[22px]">group</span>
            <h3 className="font-headline text-base font-bold text-[#0f172a]">
              Usuários Cadastrados ({registeredUsers.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="text-xs text-[#006194] font-bold hover:underline"
          >
            Trocar / Cadastrar Novo
          </button>
        </div>

        <div className="space-y-2">
          {registeredUsers.map(user => {
            const isMe = user.id === currentUser?.id;
            const displayName = cleanUserName(user.name);

            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#006194] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#cbd5e1]">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(displayName)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0f172a] flex items-center gap-1.5">
                      {displayName}
                      {isMe && (
                        <span className="text-[10px] bg-[#dbeafe] text-[#1d4ed8] px-2 py-0.5 rounded-full font-bold">
                          Você
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#64748b]">@{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isMe && registeredUsers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Deseja excluir o usuário ${displayName}?`)) {
                          deleteUserAccount(user.id);
                          showToast('Usuário removido.');
                        }
                      }}
                      className="p-1.5 text-[#94a3b8] hover:text-[#ba1a1a] hover:bg-[#fee2e2] rounded-lg transition-colors"
                      title="Excluir usuário"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Prominent Sair Button in place of the old red Zerar button */}
        <div className="pt-3 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#64748b]">
            Deseja encerrar sua sessão ou alternar de usuário neste aparelho?
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#ba1a1a] bg-[#fee2e2]/40 hover:bg-[#fee2e2] text-[#ba1a1a] font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
