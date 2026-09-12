import React, { useState } from 'react';
import { StorageManager, DEFAULT_HWID, MASTER_UNLOCK_CODE, ADMIN_WHATSAPP_DISPLAY } from '../lib/storage';
import { AccessRequest } from '../types';

interface AdminRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockTerminalDirectly: (code: string) => void;
}

export const AdminRequestsModal: React.FC<AdminRequestsModalProps> = ({
  isOpen,
  onClose,
  onUnlockTerminalDirectly,
}) => {
  const [requests, setRequests] = useState<AccessRequest[]>(StorageManager.getAccessRequests());
  const [quickCode, setQuickCode] = useState<string>(MASTER_UNLOCK_CODE);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Gerador de Chave por HWID para clientes do WhatsApp
  const [hwidInput, setHwidInput] = useState<string>(() => StorageManager.getDeviceHwid());
  const calculatedCode = StorageManager.getHwidUnlockCode(hwidInput);
  const [copiedCustomHwid, setCopiedCustomHwid] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleApprove = (req: AccessRequest) => {
    StorageManager.approveAccessRequest(req.id);
    setRequests(StorageManager.getAccessRequests());
  };

  const handleCopyCode = (req: AccessRequest) => {
    const code = StorageManager.getHwidUnlockCode(req.hwid) || req.accessCode || MASTER_UNLOCK_CODE;
    const msg = `Olá ${req.fullName}! Seu código de liberação exclusivo para o computador ${req.hwid} no PC Craft é: ${code}`;
    navigator.clipboard.writeText(msg);
    setCopiedId(req.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyCustomHwidCode = () => {
    const msg = `Olá! Seu código de liberação exclusivo para o computador ${hwidInput.trim()} no PC Craft é: ${calculatedCode}`;
    navigator.clipboard.writeText(msg);
    setCopiedCustomHwid(true);
    setTimeout(() => setCopiedCustomHwid(false), 2500);
  };

  const handleGenerateNewCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setQuickCode(code);
    StorageManager.createAccessRequest({
      hwid: hwidInput || DEFAULT_HWID,
      fullName: 'Terminal Balcão (Novo Código)',
      email: 'gestor@pccraft.com.br',
      whatsapp: '47988611619',
      storeName: 'PC Craft Hardware',
      role: 'Vendedor / Operador',
    });
    setRequests(StorageManager.getAccessRequests());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-[#00344f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#5dc6ff]">admin_panel_settings</span>
            <div>
              <h2 className="text-base font-bold">Painel do Administrador - Liberação de Acesso</h2>
              <p className="text-[11px] text-blue-200">Gerenciador de Códigos de 6 Dígitos &amp; Terminais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Quick Action Banner */}
        <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00658c] text-[20px]">pin</span>
            <div>
              <span className="text-xs text-slate-600 font-medium">Código Master (Jesiel): </span>
              <span className="font-mono font-bold text-sm text-[#00344f] bg-white px-2 py-0.5 rounded border border-blue-200">
                {quickCode}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUnlockTerminalDirectly(quickCode)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[15px]">lock_open</span>
              <span>Liberar Agora</span>
            </button>
            <button
              onClick={handleGenerateNewCode}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              + Novo Código
            </button>
          </div>
        </div>

        {/* Gerador de Chave Anti-Repasse por HWID (Para quem comprou o App) */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#00344f]">
              <span className="material-symbols-outlined text-[18px]">vpn_key</span>
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Gerador de Chave Anti-Repasse por Hardware ID
              </h3>
            </div>
            <span className="text-[10px] bg-blue-100 text-[#00344f] px-1.5 py-0.5 rounded font-bold">
              1 Licença / 1 Computador
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-tight">
            Cole o Hardware ID enviado pelo cliente no WhatsApp para ver o código de ativação exclusivo dele:
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={hwidInput}
              onChange={(e) => setHwidInput(e.target.value)}
              placeholder="Ex: PCC-8492-XF88"
              className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase bg-white outline-none focus:border-[#00658c]"
            />
            <div className="h-9 px-3 bg-white border border-slate-300 rounded-lg flex items-center gap-1 font-mono font-bold text-sm text-[#00658c]">
              <span>{calculatedCode}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCustomHwidCode}
              className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>{copiedCustomHwid ? 'Copiado!' : 'Copiar Resposta'}</span>
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-bold text-slate-700">
              Solicitações de Acesso ({requests.length})
            </h3>
            <span className="text-[11px] text-slate-500">Aprovações enviadas via WhatsApp</span>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <span className="material-symbols-outlined text-[36px] mb-1">inbox</span>
              <p className="text-xs">Nenhuma solicitação no momento.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{req.fullName}</h4>
                    <p className="text-xs text-slate-500">{req.role} • {req.storeName}</p>
                    <p className="text-[11px] text-[#00658c] font-mono mt-0.5">{req.hwid}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'aprovado'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(req.requestedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Código de 6 dígitos:</span>
                    <span className="font-mono font-bold text-sm text-[#00344f] bg-white px-2 py-0.5 rounded border border-slate-200">
                      {req.accessCode || MASTER_UNLOCK_CODE}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyCode(req)}
                      className="px-2 py-1 text-slate-700 hover:text-[#00658c] bg-white hover:bg-slate-100 rounded border border-slate-200 text-xs font-medium flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedId === req.id ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedId === req.id ? 'Copiado!' : 'Copiar'}</span>
                    </button>

                    {req.whatsapp && (
                      <a
                        href={`https://wa.me/55${req.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Olá ${req.fullName}! Seu código de liberação para o terminal no PC Craft Hardware é: ${
                            req.accessCode || MASTER_UNLOCK_CODE
                          }. Digite no aplicativo para acessar.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 text-xs font-semibold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        <span>Enviar no WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {req.status !== 'aprovado' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(req)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      <span>Marcar como Aprovado</span>
                    </button>
                    <button
                      onClick={() => onUnlockTerminalDirectly(req.accessCode || MASTER_UNLOCK_CODE)}
                      className="flex-1 py-1.5 bg-[#034c70] hover:bg-[#00344f] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">lock_open</span>
                      <span>Liberar este Terminal Agora</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
