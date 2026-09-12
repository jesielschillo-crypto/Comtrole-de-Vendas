import React, { useState } from 'react';
import { StorageManager } from '../lib/storage';

interface LockScreenProps {
  onUnlocked: () => void;
  onOpenAdminPanel: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlocked, onOpenAdminPanel }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setError('Preencha nome, e-mail, usuário e senha.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    const user = StorageManager.registerUser({
      fullName: name.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase().replace(/\s+/g, ''),
      passwordHash: password,
      phone: '',
      role: 'Administrador',
    });

    StorageManager.unlockTerminal(undefined, user);
    onUnlocked();
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Informe seu usuário ou e-mail e sua senha.');
      return;
    }

    const user = StorageManager.loginUser(loginIdentifier.trim(), loginPassword);
    if (!user) {
      setError('Usuário ou senha incorretos.');
      return;
    }

    StorageManager.unlockTerminal(undefined, user);
    onUnlocked();
  };

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <header className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#034c70] flex items-center justify-center text-[#5dc6ff] shrink-0">
              <span className="material-symbols-outlined text-[25px]">memory</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 truncate">PC Craft Hardware</h1>
              <p className="text-[10px] text-[#00658c] uppercase font-bold tracking-wide break-words">
                Vendas de PCs e periféricos
              </p>
            </div>
          </div>
          <button type="button" onClick={onOpenAdminPanel} title="Painel administrador" className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg shrink-0">
            <span className="material-symbols-outlined text-[18px]">shield</span>
          </button>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex gap-1 p-1 mb-5 bg-slate-100 rounded-xl">
            <button type="button" onClick={() => switchMode('login')} className={`flex-1 min-w-0 py-2.5 px-2 rounded-lg text-sm font-bold ${mode === 'login' ? 'bg-white text-[#034c70] shadow-sm' : 'text-slate-500'}`}>
              Entrar
            </button>
            <button type="button" onClick={() => switchMode('register')} className={`flex-1 min-w-0 py-2.5 px-2 rounded-lg text-sm font-bold ${mode === 'register' ? 'bg-white text-[#034c70] shadow-sm' : 'text-slate-500'}`}>
              Criar conta
            </button>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">{mode === 'login' ? 'Entrar no sistema' : 'Criar sua conta'}</h2>
            <p className="text-sm text-slate-500 mt-1 break-words">
              {mode === 'login' ? 'Use seu usuário ou e-mail e senha.' : 'Cadastre seus dados por e-mail para começar.'}
            </p>
          </div>

          {error && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold break-words">{error}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">
                Usuário ou e-mail
                <input value={loginIdentifier} onChange={event => setLoginIdentifier(event.target.value)} required className="mt-1.5 w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal outline-none focus:border-[#00658c]" autoComplete="username" />
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Senha
                <input type="password" value={loginPassword} onChange={event => setLoginPassword(event.target.value)} required className="mt-1.5 w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal outline-none focus:border-[#00658c]" autoComplete="current-password" />
              </label>
              <button type="submit" className="w-full h-12 bg-[#034c70] hover:bg-[#00344f] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">login</span>
                Entrar no sistema
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <label className="block text-sm font-bold text-slate-700">Nome completo<input value={name} onChange={event => setName(event.target.value)} required className="mt-1.5 w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal outline-none focus:border-[#00658c]" autoComplete="name" /></label>
              <label className="block text-sm font-bold text-slate-700">E-mail<input type="email" value={email} onChange={event => setEmail(event.target.value)} required className="mt-1.5 w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal outline-none focus:border-[#00658c]" autoComplete="email" /></label>
              <label className="block text-sm font-bold text-slate-700">Usuário<input value={username} onChange={event => setUsername(event.target.value)} required className="mt-1.5 w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal outline-none focus:border-[#00658c]" autoComplete="username" /></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-sm font-bold text-slate-700">Senha<input type="password" value={password} onChange={event => setPassword(event.target.value)} required className="mt-1.5 w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal outline-none focus:border-[#00658c]" autoComplete="new-password" /></label>
                <label className="block text-sm font-bold text-slate-700">Confirmar senha<input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required className="mt-1.5 w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal outline-none focus:border-[#00658c]" autoComplete="new-password" /></label>
              </div>
              <button type="submit" className="w-full h-12 bg-[#034c70] hover:bg-[#00344f] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-1">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                Cadastrar e entrar
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">Acesso direto com sua conta, sem código ou solicitação.</p>
      </div>
    </div>
  );
};
