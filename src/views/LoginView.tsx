import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AvatarSelector } from '../components/AvatarSelector';
import { cleanUserName } from '../utils/avatarUtils';
import { AdminUser } from '../types';

export const LoginView: React.FC = () => {
  const {
    login,
    registerUser,
    registeredUsers,
    requirePasswordOnEveryEntry,
    setRequirePasswordOnEveryEntry,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Selected user account for clicking and entering password
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(() => {
    return registeredUsers.length > 0 ? registeredUsers[0] : null;
  });

  // Password for selected user or manual login
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Preference: remember on device (false = ask password every time)
  const [rememberDevice, setRememberDevice] = useState(!requirePasswordOnEveryEntry);

  // Registration state (ONLY 4 fields requested: Nome Completo, Usuário, Senha, Confirmar Senha)
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAvatarUrl, setRegAvatarUrl] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Sync selectedUser if registeredUsers change
  useEffect(() => {
    if (registeredUsers.length > 0 && !selectedUser) {
      setSelectedUser(registeredUsers[0]);
    }
  }, [registeredUsers, selectedUser]);

  const handleSelectUser = (user: AdminUser) => {
    setSelectedUser(user);
    setPasswordInput('');
    setLoginError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!selectedUser) {
      setLoginError('Selecione um usuário para continuar.');
      return;
    }

    if (!passwordInput.trim()) {
      setLoginError('Por favor, digite a sua senha.');
      return;
    }

    setIsLoading(true);

    // Update the password frequency preference
    setRequirePasswordOnEveryEntry(!rememberDevice);

    setTimeout(() => {
      const result = login(selectedUser.username, passwordInput);
      setIsLoading(false);
      if (!result.success) {
        setLoginError(result.message || 'Senha incorreta.');
      }
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanName = cleanUserName(regName.trim());
    if (!cleanName) {
      setRegError('Por favor, informe seu nome completo.');
      return;
    }

    const cleanUser = regUsername.trim().toLowerCase();
    if (!cleanUser) {
      setRegError('Informe um nome de usuário.');
      return;
    }

    if (regPassword.length < 3) {
      setRegError('A senha deve ter pelo menos 3 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas digitadas não coincidem.');
      return;
    }

    setIsLoading(true);
    setRequirePasswordOnEveryEntry(!rememberDevice);

    setTimeout(() => {
      const result = registerUser({
        name: cleanName,
        username: cleanUser,
        password: regPassword,
        avatarUrl: regAvatarUrl || undefined,
        storeName: 'PC Craft',
      });

      setIsLoading(false);
      if (!result.success) {
        setRegError(result.message || 'Erro ao cadastrar usuário.');
      }
    }, 350);
  };

  const getInitials = (name: string) => {
    const parts = cleanUserName(name).split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#006194] text-white flex items-center justify-center shadow-lg shadow-[#006194]/25">
            <span className="material-symbols-outlined text-[36px]">memory</span>
          </div>
          <div>
            <h1 className="font-headline text-[28px] font-bold text-[#0f172a] tracking-tight">
              PC Craft
            </h1>
            <p className="font-body text-xs sm:text-[13px] text-[#64748b]">
              Sistema de Bancada, Vendas & Carnê para Celular e PC
            </p>
          </div>
        </div>

        {/* Tab Switcher: Login vs Cadastrar */}
        <div className="bg-white p-1 rounded-2xl border border-[#e2e8f0] shadow-xs flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'login'
                ? 'bg-[#006194] text-white shadow-sm'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
            <span>Entrar na Conta</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'register'
                ? 'bg-[#006194] text-white shadow-sm'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Cadastrar Usuário</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] space-y-5">
          {activeTab === 'login' ? (
            /* ================= LOGIN: CLICK ON REGISTERED NAME & TYPE PASSWORD ================= */
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="font-headline text-lg font-bold text-[#0f172a]">
                  Quem está acessando?
                </h2>
                <p className="font-body text-xs text-[#64748b]">
                  Clique no seu nome cadastrado e digite sua senha para entrar
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-[#fee2e2] text-[#ba1a1a] rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{loginError}</span>
                </div>
              )}

              {/* List of registered user cards */}
              <div className="space-y-2">
                <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                  Selecione seu perfil ({registeredUsers.length}):
                </label>

                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                  {registeredUsers.map(user => {
                    const isSelected = selectedUser?.id === user.id;
                    const displayName = cleanUserName(user.name);

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? 'border-[#006194] bg-[#eff6ff] shadow-xs ring-2 ring-[#006194]/20'
                            : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#006194] text-white flex items-center justify-center font-headline font-bold text-sm shrink-0 border border-[#cbd5e1]">
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

                          <div className="min-w-0 flex-1">
                            <p className="font-headline font-bold text-sm text-[#0f172a] truncate">
                              {displayName}
                            </p>
                            <p className="font-body text-xs text-[#64748b] truncate">
                              @{user.username}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          {isSelected ? (
                            <span className="w-6 h-6 rounded-full bg-[#006194] text-white flex items-center justify-center">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </span>
                          ) : (
                            <span className="text-xs text-[#94a3b8] font-semibold">
                              Selecionar
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Password entry form for the selected user */}
              {selectedUser && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2 border-t border-[#f1f5f9]">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="user-password"
                        className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block"
                      >
                        Senha de acesso para {cleanUserName(selectedUser.name)}
                      </label>
                    </div>

                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#94a3b8] text-[20px]">
                        lock
                      </span>
                      <input
                        id="user-password"
                        type={showPassword ? 'text' : 'password'}
                        autoFocus
                        required
                        value={passwordInput}
                        onChange={e => setPasswordInput(e.target.value)}
                        placeholder="Digite sua senha"
                        className="w-full h-11 pl-11 pr-10 bg-[#f8fafc] text-[#0f172a] rounded-xl font-body text-sm border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[#94a3b8] hover:text-[#475569]"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Password entry frequency option: Entrar uma vez só vs Pedir senha toda vez */}
                  <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0] space-y-2">
                    <label className="text-xs font-bold text-[#334155] block">
                      Preferência de acesso neste aparelho:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          rememberDevice
                            ? 'bg-white border-[#006194] text-[#006194] font-bold shadow-2xs'
                            : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="login-mode"
                          checked={rememberDevice}
                          onChange={() => setRememberDevice(true)}
                          className="accent-[#006194]"
                        />
                        <span>Entrar uma vez só</span>
                      </label>

                      <label
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          !rememberDevice
                            ? 'bg-white border-[#006194] text-[#006194] font-bold shadow-2xs'
                            : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="login-mode"
                          checked={!rememberDevice}
                          onChange={() => setRememberDevice(false)}
                          className="accent-[#006194]"
                        />
                        <span>Digitar senha toda vez</span>
                      </label>
                    </div>

                    <p className="text-[10px] text-[#64748b]">
                      {rememberDevice
                        ? 'Você permanecerá conectado no aparelho sem precisar redigitar a senha.'
                        : 'O app pedirá a senha sempre que for aberto para maior segurança.'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-headline text-[15px] font-bold flex items-center justify-center gap-2 shadow-md shadow-[#006194]/20 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">
                          sync
                        </span>
                        <span>Acessando...</span>
                      </>
                    ) : (
                      <>
                        <span>Acessar App</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Quick action to register */}
              <div className="pt-2 border-t border-[#f1f5f9] text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs text-[#006194] font-bold hover:underline"
                >
                  Cadastrar novo usuário &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* ================= REGISTER: ONLY NOME COMPLETO, USUÁRIO, SENHA E CONFIRMAR SENHA ================= */
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="font-headline text-lg font-bold text-[#0f172a]">
                  Cadastrar Novo Usuário
                </h2>
                <p className="font-body text-xs text-[#64748b]">
                  Preencha os 4 campos abaixo para criar seu acesso no sistema
                </p>
              </div>

              {regError && (
                <div className="p-3 bg-[#fee2e2] text-[#ba1a1a] rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* 1. Nome Completo */}
                <div className="space-y-1">
                  <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#94a3b8] text-[20px]">
                      person
                    </span>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Ex: Thiago Almeida"
                      className="w-full h-11 pl-11 pr-3 bg-[#f8fafc] text-[#0f172a] rounded-xl font-body text-sm border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
                    />
                  </div>
                </div>

                {/* 2. Usuário */}
                <div className="space-y-1">
                  <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                    Nome de Usuário *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#94a3b8] text-[20px]">
                      alternate_email
                    </span>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                      placeholder="Ex: thiago"
                      className="w-full h-11 pl-11 pr-3 bg-[#f8fafc] text-[#0f172a] rounded-xl font-body text-sm border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
                    />
                  </div>
                </div>

                {/* 3. Senha & 4. Confirmar Senha */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                      Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Mínimo 3 dígitos"
                        className="w-full h-11 pl-3 pr-9 bg-[#f8fafc] text-[#0f172a] rounded-xl font-body text-sm border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-3 text-[#94a3b8] hover:text-[#475569]"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showRegPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                      Confirmar Senha *
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full h-11 px-3 bg-[#f8fafc] text-[#0f172a] rounded-xl font-body text-sm border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
                    />
                  </div>
                </div>

                {/* Foto de Perfil do Usuário */}
                <AvatarSelector
                  currentAvatarUrl={regAvatarUrl}
                  onAvatarChange={setRegAvatarUrl}
                  userName={regName || 'Novo Usuário'}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-headline text-[15px] font-bold flex items-center justify-center gap-2 shadow-md shadow-[#006194]/20 transition-all active:scale-[0.98] mt-2"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">
                        sync
                      </span>
                      <span>Cadastrando...</span>
                    </>
                  ) : (
                    <>
                      <span>Cadastrar & Acessar App</span>
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-[#006194] font-bold hover:underline"
                >
                  Já possui um usuário cadastrado? Fazer Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info: Celular e PC Ready */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#475569]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#006194]">smartphone</span>
              Celular
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#006194]">desktop_windows</span>
              Computador / PC
            </span>
          </div>

          <p className="text-[11px] text-[#64748b]">
            Total de perfis cadastrados: {registeredUsers.length}
          </p>
        </div>
      </div>
    </div>
  );
};
