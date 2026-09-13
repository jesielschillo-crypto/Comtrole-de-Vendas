import React, { useState } from 'react';
import { StorageManager, ADMIN_WHATSAPP_DISPLAY, ADMIN_EMAIL } from '../lib/storage';

interface QuickApprovalScreenProps {
  hwidToApprove: string;
  buyerName?: string;
  onGoToApp: () => void;
}

export const QuickApprovalScreen: React.FC<QuickApprovalScreenProps> = ({
  hwidToApprove,
  buyerName = 'Cliente / Comprador',
  onGoToApp,
}) => {
  const [approved, setApproved] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const hwid = hwidToApprove.trim();
  const unlockCode = StorageManager.getHwidUnlockCode(hwid);

  // URL direta para o cliente desbloquear com 1 clique no computador dele
  const clientUnlockUrl = `${window.location.origin}${window.location.pathname}?unlock=${unlockCode}&hwid=${encodeURIComponent(hwid)}`;

  const handleApprove = () => {
    StorageManager.approveHwid(hwid, unlockCode, buyerName);
    setApproved(true);
  };

  const handleCopyClientLink = () => {
    navigator.clipboard.writeText(clientUnlockUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const whatsappClientReply = `https://wa.me/?text=${encodeURIComponent(
    `Olá ${buyerName}! Seu acesso à VTECH foi APROVADO com sucesso! 🎉\n\n💻 Computador: ${hwid}\n🔑 Seu Código de 6 Dígitos: ${unlockCode}\n\n👉 Ou clique direto no link abaixo no seu computador para abrir já liberado:\n${clientUnlockUrl}`
  )}`;

  const emailClientReply = `mailto:?subject=${encodeURIComponent(
    `Acesso Liberado - VTECH (${hwid})`
  )}&body=${encodeURIComponent(
    `Olá ${buyerName}!\n\nSeu acesso ao sistema foi APROVADO com sucesso! 🎉\n\n💻 Computador: ${hwid}\n🔑 Código de Liberação: ${unlockCode}\n\n👉 Ou clique no link abaixo para abrir já liberado:\n${clientUnlockUrl}`
  )}`;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-center items-center p-4 antialiased selection:bg-[#c6e7ff] selection:text-[#00344f]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#00344f] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-[#5dc6ff]">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div>
              <h1 className="text-base font-bold">Portal de Liberação - VTECH</h1>
              <p className="text-[11px] text-blue-200 font-medium">Aprovação de Acesso com 1 Clique</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
            ADM
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!approved ? (
            <>
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00658c] flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-[28px]">phonelink_lock</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">Solicitação de Acesso Recebida</h2>
                <p className="text-xs text-slate-500">
                  Um cliente solicitou liberação para utilizar a VTECH neste computador:
                </p>
              </div>

              {/* Informações do Aparelho Solicitante */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Solicitante:</span>
                  <span className="font-bold text-slate-800">{buyerName}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Hardware ID:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {hwid}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Chave deste Aparelho:</span>
                  <span className="font-mono font-extrabold text-base text-[#00658c]">
                    {unlockCode}
                  </span>
                </div>
              </div>

              {/* Botão Principal: Aceitar Acesso */}
              <button
                type="button"
                onClick={handleApprove}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Aceitar e Liberar Acesso Agora</span>
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Ao clicar em aceitar, a licença é vinculada exclusivamente a este computador.
              </p>
            </>
          ) : (
            <>
              {/* Confirmação de Sucesso */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs animate-bounce">
                  <span className="material-symbols-outlined text-[32px]">task_alt</span>
                </div>
                <h2 className="text-lg font-bold text-emerald-950">Acesso Aprovado com Sucesso!</h2>
                <p className="text-xs text-slate-600">
                  O computador <strong className="font-mono">{hwid}</strong> foi liberado com a chave:
                </p>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="font-mono font-extrabold text-2xl text-emerald-800 tracking-widest">
                    {unlockCode}
                  </span>
                </div>
              </div>

              {/* Opções de Resposta para o Cliente */}
              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enviar liberação para o cliente:
                </p>

                {/* WhatsApp */}
                <a
                  href={whatsappClientReply}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Enviar Chave e Link no WhatsApp</span>
                </a>

                {/* E-mail */}
                <a
                  href={emailClientReply}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200"
                >
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  <span>Enviar Chave por E-mail</span>
                </a>

                {/* Copiar Link Direto */}
                <button
                  type="button"
                  onClick={handleCopyClientLink}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link de Desbloqueio com 1 Clique'}</span>
                </button>
              </div>

              {/* Botão Entrar no App */}
              <button
                type="button"
                onClick={onGoToApp}
                className="w-full mt-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-700 text-center"
              >
                Abrir o Sistema Neste Computador
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
