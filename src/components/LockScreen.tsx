import React, { useState, useEffect, useRef } from 'react';
import { StorageManager, ADMIN_WHATSAPP, ADMIN_WHATSAPP_DISPLAY, ADMIN_EMAIL } from '../lib/storage';
import { AccessRequest, UserAccount } from '../types';

interface LockScreenProps {
  onUnlocked: () => void;
  onOpenAdminPanel: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlocked, onOpenAdminPanel }) => {
  // Modos de visualização:
  // 'otp' = Inserir Código de 6 Dígitos (Padrão)
  // 'create_account' = Cadastrar Login e Senha após liberar o acesso
  // 'login' = Entrar com Login e Senha já cadastrados
  // 'request' = Solicitar código / Formulário
  const [viewMode, setViewMode] = useState<'otp' | 'create_account' | 'login' | 'request'>('otp');

  // Identificador de Hardware único deste computador (Anti-Repasse)
  const [hwid] = useState<string>(() => StorageManager.getDeviceHwid());
  const [copiedHwid, setCopiedHwid] = useState<boolean>(false);

  // OTP State (6 dígitos)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Código pronto para validação de segurança');
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Cadastro de Usuário e Senha após liberação
  const [newFullName, setNewFullName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newConfirmPassword, setNewConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [accountError, setAccountError] = useState<string>('');

  // Login com usuário existente
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Solicitação de Acesso
  const [reqName, setReqName] = useState<string>('');
  const [reqEmail, setReqEmail] = useState<string>('');
  const [reqPhone, setReqPhone] = useState<string>('');
  const [reqStore, setReqStore] = useState<string>('');
  const [requestSent, setRequestSent] = useState<AccessRequest | null>(null);

  const fillQuickCode = (code: string) => {
    setOtp(code.split(''));
    setOtpError('');
  };

  // Auto focus first OTP input when on OTP view & Auto-unlock if code is passed via URL (?unlock=XXXXXX)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('unlock') || params.get('code');
      if (urlCode) {
        const clean = urlCode.replace(/\D/g, '').slice(0, 6);
        if (clean.length === 6) {
          fillQuickCode(clean);
          const validation = StorageManager.validateHwidActivation(hwid, clean);
          if (validation.valid) {
            const users = StorageManager.getUsers();
            if (users.length > 0) {
              onUnlocked();
            } else {
              setViewMode('create_account');
            }
            return;
          }
        }
      }
    } catch {
      // ignore
    }

    if (viewMode === 'otp' && otpInputsRef.current[0]) {
      otpInputsRef.current[0].focus();
    }
  }, [viewMode, hwid, onUnlocked]);

  const handleCopyHwid = () => {
    navigator.clipboard.writeText(hwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  const handleOtpChange = (index: number, val: string) => {
    setOtpError('');
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    const target = Math.min(pasted.length, 5);
    otpInputsRef.current[target]?.focus();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const numbers = text.replace(/\D/g, '').slice(0, 6);
      if (numbers) {
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
          newOtp[i] = numbers[i] || '';
        }
        setOtp(newOtp);
        setOtpError('');
        const target = Math.min(numbers.length, 5);
        otpInputsRef.current[target]?.focus();
      }
    } catch {
      const manual = prompt('Cole o código de liberação recebido no WhatsApp:');
      if (manual) {
        const clean = manual.replace(/\D/g, '').slice(0, 6);
        if (clean) fillQuickCode(clean);
      }
    }
  };

  const handleValidateOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setOtpError('Por favor, insira todos os 6 dígitos do código de liberação.');
      return;
    }

    setIsValidating(true);
    setStatusMessage('Validando chave com o Hardware ID deste computador...');

    setTimeout(() => {
      const validation = StorageManager.validateHwidActivation(hwid, fullCode);

      if (validation.valid) {
        setStatusMessage('Código Aprovado com Sucesso para este Computador!');
        setIsValidating(false);
        // Avança para o cadastro de login e senha do usuário
        setViewMode('create_account');
      } else if (validation.reason === 'different_device') {
        setIsValidating(false);
        setOtpError(`❌ Esta chave de liberação pertence a outro computador! O PC Craft possui proteção contra repasse e cada licença é exclusiva do aparelho. Fale com Jesiel no WhatsApp (${ADMIN_WHATSAPP_DISPLAY}) para liberar este computador.`);
        setStatusMessage('Repasse não autorizado detectado');
      } else {
        setIsValidating(false);
        setOtpError(`❌ Código ${fullCode} inválido para este computador (${hwid}). Solicite a ativação com Jesiel no WhatsApp.`);
        setStatusMessage('Falha na validação do código');
      }
    }, 600);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError('');

    if (!newFullName.trim() || !newUsername.trim() || !newPassword.trim()) {
      setAccountError('Preencha os campos obrigatórios (Nome, Usuário e Senha).');
      return;
    }

    if (newPassword !== newConfirmPassword) {
      setAccountError('As senhas digitadas não coincidem.');
      return;
    }

    // Registra o usuário
    const savedUser = StorageManager.registerUser({
      fullName: newFullName.trim(),
      email: newEmail.trim() || 'jesielschillo@gmail.com',
      phone: newPhone.replace(/\D/g, '') || ADMIN_WHATSAPP,
      username: newUsername.trim(),
      passwordHash: newPassword,
      role: 'Administrador',
    });

    // Desbloqueia o terminal vinculado a esse usuário e a esse HWID
    StorageManager.unlockTerminal(otp.join(''), savedUser, hwid);
    onUnlocked();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Preencha seu usuário/e-mail e senha.');
      return;
    }

    const user = StorageManager.loginUser(loginIdentifier, loginPassword);
    if (user) {
      onUnlocked();
    } else {
      setLoginError('Usuário ou senha incorretos. Verifique suas credenciais.');
    }
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName || !reqEmail || !reqPhone) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const newReq = StorageManager.createAccessRequest({
      hwid,
      fullName: reqName,
      email: reqEmail,
      whatsapp: reqPhone,
      storeName: reqStore,
      role: 'Administrador / Gestor',
    });

    setRequestSent(newReq);
  };

  const hwidCode = StorageManager.getHwidUnlockCode(hwid);
  const baseHost = typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
    ? `${window.location.origin}${window.location.pathname}`
    : (typeof window !== 'undefined' ? window.location.href.split('?')[0] : '');
  const approveUrl = baseHost
    ? `${baseHost}?approve_hwid=${encodeURIComponent(hwid)}&hwid_code=${hwidCode}&buyer_name=${encodeURIComponent(reqName || 'Cliente')}`
    : '';

  const whatsappLink = `https://wa.me/55${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    `Olá Jesiel! Adquiri o PC Craft Hardware e solicito a liberação para o meu computador.\n\n💻 Meu Hardware ID: ${hwid}\n🔑 Código deste aparelho: ${hwidCode}\n\n👉 Para ACEITAR O ACESSO com 1 clique no seu celular, toque aqui:\n${approveUrl}`
  )}`;

  const emailLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
    `Solicitação de Acesso PC Craft - Hardware ID: ${hwid}`
  )}&body=${encodeURIComponent(
    `Olá Jesiel!\n\nAdquiri o PC Craft Hardware e solicito a liberação para o meu computador.\n\n💻 Meu Hardware ID: ${hwid}\n🔑 Código deste aparelho: ${hwidCode}\n\n👉 Para ACEITAR O ACESSO com 1 clique no seu celular ou computador, abra o link:\n${approveUrl}`
  )}`;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between p-4 sm:p-6 antialiased selection:bg-[#c6e7ff] selection:text-[#00344f]">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto">
        <header className="flex items-center justify-between pb-3 pt-1 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#034c70] flex items-center justify-center text-[#5dc6ff] shadow-sm">
              <span className="material-symbols-outlined text-[24px]">memory</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">PC Craft Hardware</h1>
              <p className="text-[10px] text-[#00658c] uppercase font-bold tracking-wider">
                Vendas de PCs Montados &amp; Periféricos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Acesso Restrito</span>
            </div>
            <button
              onClick={onOpenAdminPanel}
              title="Painel Administrador"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">shield</span>
              <span className="font-bold">ADM</span>
            </button>
          </div>
        </header>

        {/* Abas Superiores de Navegação */}
        <div className="grid grid-cols-3 gap-1 mt-3 p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('otp')}
            className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1 text-center min-w-0 ${
              viewMode === 'otp' || viewMode === 'create_account'
                ? 'bg-white text-[#034c70] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] shrink-0">pin</span>
            <span className="truncate text-[11px] sm:text-xs">Código</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('login')}
            className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1 text-center min-w-0 ${
              viewMode === 'login'
                ? 'bg-white text-[#034c70] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] shrink-0">login</span>
            <span className="truncate text-[11px] sm:text-xs">Login</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('request')}
            className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1 text-center min-w-0 ${
              viewMode === 'request'
                ? 'bg-white text-[#034c70] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] shrink-0">contact_support</span>
            <span className="truncate text-[11px] sm:text-xs">Solicitar</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: DIGITE O CÓDIGO DE LIBERAÇÃO (OTP) COM WHATSAPP EM DESTAQUE */}
        {/* ========================================================================= */}
        {viewMode === 'otp' && (
          <main className="mt-4 space-y-4">
            {/* Banner WhatsApp para Solicitar Código (Exigência Principal) */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">chat</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider">
                    WhatsApp do Administrador (Jesiel)
                  </p>
                  <p className="text-base font-extrabold text-emerald-950">
                    {ADMIN_WHATSAPP_DISPLAY}
                  </p>
                </div>
              </div>

              <p className="text-xs text-emerald-900 leading-snug">
                Adquiriu o app e precisa de liberação? Envie sua solicitação para Jesiel via WhatsApp ou E-mail (ele aprova com 1 clique):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>WhatsApp ({ADMIN_WHATSAPP_DISPLAY})</span>
                </a>

                <a
                  href={emailLink}
                  className="w-full h-11 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#00658c]">mail</span>
                  <span>Solicitar por E-mail</span>
                </a>
              </div>
            </div>

            {/* Box Hardware ID & Proteção Anti-Repasse */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#034c70]">
                  <span className="material-symbols-outlined text-[18px]">devices</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Hardware ID deste Computador
                  </h3>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Licença Individual
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Seu ID de Aparelho:</p>
                  <p className="font-mono font-bold text-sm text-slate-900">{hwid}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyHwid}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>{copiedHwid ? 'Copiado!' : 'Copiar ID'}</span>
                </button>
              </div>

              <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-tight">
                <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">lock</span>
                <p>
                  <strong>Proteção Anti-Repasse:</strong> A chave gerada é única e vinculada exclusivamente a este computador. O sistema bloqueia repasse ou uso compartilhado em outras máquinas.
                </p>
              </div>

            </div>

            {/* Inserção do Código (6 Dígitos) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">Digite ou Cole o Código</h2>
                  <p className="text-[11px] text-slate-500">
                    Insira os 6 dígitos recebidos no WhatsApp:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#00658c] rounded-lg text-xs font-bold border border-blue-200 flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                  title="Colar código copiado"
                >
                  <span className="material-symbols-outlined text-[15px]">content_paste</span>
                  <span className="hidden xs:inline">Colar</span>
                </button>
              </div>

              <form onSubmit={handleValidateOtp} className="space-y-4">
                <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5 max-w-sm mx-auto w-full">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-full aspect-square max-h-14 text-center text-xl sm:text-2xl font-extrabold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:border-[#00658c] focus:ring-2 focus:ring-[#00658c]/20 focus:bg-white outline-none transition-all p-0"
                      aria-label={`Dígito ${idx + 1}`}
                    />
                  ))}
                </div>

                {otpError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs text-center font-semibold border border-rose-200">
                    {otpError}
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-50 text-slate-600 text-center text-xs">
                  <span className="material-symbols-outlined text-[16px] text-[#00658c]">shield</span>
                  <span>{statusMessage}</span>
                </div>

                <button
                  type="submit"
                  disabled={isValidating}
                  className="w-full h-12 bg-[#034c70] hover:bg-[#00344f] active:scale-[0.98] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-75"
                >
                  {isValidating ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      <span>Validando Código...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      <span>Liberar Acesso &amp; Cadastrar Senha</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </main>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CADASTRAR SENHA E LOGIN DE USUÁRIO DEPOIS DE LIBERAR O ACESSO */}
        {/* ========================================================================= */}
        {viewMode === 'create_account' && (
          <main className="mt-4 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">Acesso Liberado com Sucesso!</h3>
                <p className="text-xs text-emerald-800">
                  Agora cadastre seu Login e Senha para poder acessar o sistema diariamente.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">Cadastro do Usuário / Operador</h2>
                <p className="text-xs text-slate-500">Defina os dados para login no sistema PC Craft</p>
              </div>

              {accountError && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                  {accountError}
                </div>
              )}

              <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Ex: Jesiel Schillo"
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">WhatsApp / Celular *</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="(47) 98861-1619"
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="jesielschillo@gmail.com"
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Nome de Usuário (Login) *</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="ex: jesiel"
                      className="w-full h-10 pl-3 pr-10 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm font-semibold"
                    />
                    <span className="material-symbols-outlined absolute right-3 text-slate-400 text-[18px]">
                      person
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">Este será o seu usuário para entrar no sistema.</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Senha de Acesso *</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="******"
                        className="w-full h-10 px-3 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Confirmar Senha *</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newConfirmPassword}
                        onChange={(e) => setNewConfirmPassword(e.target.value)}
                        placeholder="******"
                        className="w-full h-10 px-3 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="showPass"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 text-[#00658c] rounded cursor-pointer"
                  />
                  <label htmlFor="showPass" className="text-xs text-slate-600 cursor-pointer">
                    Mostrar senhas digitadas
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 bg-[#034c70] hover:bg-[#00344f] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    <span>Salvar Usuário &amp; Entrar no Sistema</span>
                  </button>
                </div>
              </form>
            </div>
          </main>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: LOGIN COM USUÁRIO E SENHA JÁ CADASTRADOS */}
        {/* ========================================================================= */}
        {viewMode === 'login' && (
          <main className="mt-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">Entrar com Login e Senha</h2>
                <p className="text-xs text-slate-500">Acesse com suas credenciais de usuário cadastradas</p>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Usuário ou E-mail</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="ex: jesiel ou seu email"
                      className="w-full h-11 pl-3 pr-10 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm"
                    />
                    <span className="material-symbols-outlined absolute right-3 text-slate-400 text-[18px]">
                      person
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 uppercase">Senha</label>
                    <span className="text-[10px] text-slate-400">Padrão inicial: 123456</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="******"
                      className="w-full h-11 pl-3 pr-10 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm"
                    />
                    <span className="material-symbols-outlined absolute right-3 text-slate-400 text-[18px]">
                      lock
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full h-12 bg-[#034c70] hover:bg-[#00344f] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    <span>Entrar no Sistema</span>
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('otp')}
                      className="text-xs text-[#00658c] font-semibold hover:underline"
                    >
                      Não tem senha? Entrar com código
                    </button>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      <span>Suporte WhatsApp</span>
                    </a>
                  </div>
                </div>
              </form>
            </div>
          </main>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: FORMULÁRIO DE SOLICITAÇÃO DE ACESSO */}
        {/* ========================================================================= */}
        {viewMode === 'request' && (
          <main className="mt-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Solicitar Acesso ao Sistema</h2>
                  <p className="text-xs text-slate-500">Envie seus dados para liberação do aparelho</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('otp')}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {requestSent ? (
                <div className="space-y-3 py-2 text-center">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[32px]">check_circle</span>
                    <h3 className="text-sm font-bold text-emerald-900">Solicitação Enviada!</h3>
                    <p className="text-xs text-emerald-800">
                      Seu código gerado para ativação pelo administrador é:
                    </p>
                    <div className="py-2 px-4 bg-white rounded-xl border border-emerald-300 font-mono text-xl font-bold tracking-widest text-emerald-900 inline-block">
                      {requestSent.accessCode}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={`https://wa.me/55${ADMIN_WHATSAPP}?text=${encodeURIComponent(
                        `Olá Jesiel! Solicitei acesso ao PC Craft Hardware:\nNome: ${requestSent.fullName}\nHardware ID: ${requestSent.hwid}\nCódigo deste aparelho: ${requestSent.accessCode}\n\n👉 Para ACEITAR O ACESSO com 1 clique no seu celular, toque aqui:\n${window.location.origin}${window.location.pathname}?approve_hwid=${encodeURIComponent(requestSent.hwid)}&hwid_code=${requestSent.accessCode}&buyer_name=${encodeURIComponent(requestSent.fullName)}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      <span>Enviar no WhatsApp</span>
                    </a>

                    <a
                      href={`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
                        `Solicitação de Acesso PC Craft - ${requestSent.fullName} (${requestSent.hwid})`
                      )}&body=${encodeURIComponent(
                        `Olá Jesiel!\n\nSolicitei acesso ao PC Craft Hardware:\nNome: ${requestSent.fullName}\nEmail: ${requestSent.email}\nHardware ID: ${requestSent.hwid}\nCódigo deste aparelho: ${requestSent.accessCode}\n\n👉 Para ACEITAR O ACESSO com 1 clique no seu celular ou computador, abra o link:\n${window.location.origin}${window.location.pathname}?approve_hwid=${encodeURIComponent(requestSent.hwid)}&hwid_code=${requestSent.accessCode}&buyer_name=${encodeURIComponent(requestSent.fullName)}`
                      )}`}
                      className="w-full h-12 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#00658c]">mail</span>
                      <span>Enviar por E-mail</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (requestSent.accessCode) {
                        setOtp(requestSent.accessCode.split(''));
                      }
                      setViewMode('otp');
                    }}
                    className="w-full h-11 bg-[#034c70] text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">key</span>
                    <span>Inserir Código e Liberar</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="Ex: Jesiel Schillo"
                      className="w-full h-10 px-3 bg-white text-slate-900 text-sm rounded-xl border border-slate-300 focus:border-[#00658c] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={reqPhone}
                      onChange={(e) => setReqPhone(e.target.value)}
                      placeholder="(47) 98861-1619"
                      className="w-full h-10 px-3 bg-white text-slate-900 text-sm rounded-xl border border-slate-300 focus:border-[#00658c] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="jesielschillo@gmail.com"
                      className="w-full h-10 px-3 bg-white text-slate-900 text-sm rounded-xl border border-slate-300 focus:border-[#00658c] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Nome da Loja</label>
                    <input
                      type="text"
                      value={reqStore}
                      onChange={(e) => setReqStore(e.target.value)}
                      placeholder="PC Craft Hardware"
                      className="w-full h-10 px-3 bg-white text-slate-900 text-sm rounded-xl border border-slate-300 focus:border-[#00658c] outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-12 bg-[#034c70] hover:bg-[#00344f] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">send</span>
                      <span>Gerar Código de Solicitação</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className="pt-6 pb-2 text-center text-xs text-slate-500">
        <div className="inline-flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-700">PC Craft v2.4 • Hardware &amp; Supabase</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Suporte: WhatsApp {ADMIN_WHATSAPP_DISPLAY} • Blumenau - SC
        </p>
      </footer>
    </div>
  );
};
