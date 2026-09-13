import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Installment, InstallmentStatus } from '../types';
import {
  formatMoney,
  generateReceiptText,
  generateWhatsAppUrl,
} from '../utils/formatters';

export const ReceiptView: React.FC = () => {
  const {
    sales,
    selectedSale,
    setSelectedSale,
    updateInstallment,
    setCurrentView,
    adminName,
    storeName,
    currentUser,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal for editing/updating installment payment date & status
  const [activeInstallmentForEdit, setActiveInstallmentForEdit] = useState<Installment | null>(null);
  const [editStatus, setEditStatus] = useState<InstallmentStatus>('paid');
  const [editPaidDate, setEditPaidDate] = useState<string>('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('PIX');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for date input
  const toInputDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return dateStr;
  };

  // Convert YYYY-MM-DD to DD/MM/YYYY
  const toDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-');
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    return dateStr;
  };

  const handleOpenInstallmentModal = (inst: Installment) => {
    setActiveInstallmentForEdit(inst);
    setEditStatus(inst.status);
    setEditPaidDate(toInputDate(inst.paidAt || new Date().toISOString().split('T')[0]));
    setEditPaymentMethod(inst.paidPaymentMethod || 'PIX');
    setEditAmount(inst.amount);
    setEditDueDate(inst.dueDate);
    setEditNotes(inst.paidNotes || '');
  };

  const handleSaveInstallment = () => {
    if (!activeInstallmentForEdit || !selectedSale) return;

    const formattedPaidAt = editStatus === 'paid' ? toDisplayDate(editPaidDate) : undefined;

    updateInstallment(selectedSale.id, activeInstallmentForEdit.id, {
      status: editStatus,
      paidAt: formattedPaidAt,
      paidPaymentMethod: editStatus === 'paid' ? editPaymentMethod : undefined,
      paidNotes: editNotes.trim() || undefined,
      amount: editAmount > 0 ? editAmount : activeInstallmentForEdit.amount,
      dueDate: editDueDate.trim() || activeInstallmentForEdit.dueDate,
    });

    setActiveInstallmentForEdit(null);
    showToast(
      editStatus === 'paid'
        ? `Parcela ${activeInstallmentForEdit.installmentNumber} registrada como paga em ${formattedPaidAt}!`
        : `Status da parcela ${activeInstallmentForEdit.installmentNumber} atualizado.`
    );
  };

  const handleSendInstallmentReceiptWhatsApp = (inst: Installment) => {
    if (!selectedSale) return;
    const paidDate = inst.paidAt || new Date().toLocaleDateString('pt-BR');
    const method = inst.paidPaymentMethod || 'PIX';
    const text = `*COMPROVANTE DE PAGAMENTO DE PARCELA*\n\n` +
      `Cliente: *${selectedSale.clientName}*\n` +
      `Referência: *${selectedSale.saleCode}* (${selectedSale.productDescription})\n\n` +
      `Parcela: *${inst.installmentNumber}ª de ${selectedSale.installmentCount}*\n` +
      `Valor Pago: *${formatMoney(inst.amount)}*\n` +
      `Data do Pagamento: *${paidDate}*\n` +
      `Forma: *${method}*\n\n` +
      `Saldo Restante: *${formatMoney(Math.max(0, selectedSale.remainingBalance - (inst.status === 'paid' ? 0 : inst.amount)))}*\n\n` +
      `_Agradecemos a confiança! - VTECH_`;

    const url = generateWhatsAppUrl(selectedSale.clientPhone, text);
    window.open(url, '_blank');
  };

  // If no sales exist in the system yet
  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[70vh] max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#eff6ff] text-[#006194] flex items-center justify-center shadow-xs">
          <span className="material-symbols-outlined text-[36px]">receipt_long</span>
        </div>
        <div className="space-y-1">
          <h2 className="font-headline text-[20px] font-bold text-[#0f172a]">
            Nenhuma Venda Cadastrada
          </h2>
          <p className="font-body text-[13px] text-[#64748b]">
            O sistema está zerado e pronto para você cadastrar e montar suas vendas com cálculo automático de parcelas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCurrentView('new_sale')}
          className="px-5 py-3 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-headline text-[14px] font-bold shadow-md flex items-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
          <span>Registrar Primeira Venda</span>
        </button>
      </div>
    );
  }

  // If selectedSale is null but sales exist, pick first
  const currentSale = selectedSale || sales[0];

  const perInstallment =
    currentSale.installmentCount > 0
      ? currentSale.remainingBalance / currentSale.installmentCount
      : 0;

  const receiptMsg = generateReceiptText({
    clientName: currentSale.clientName,
    productDescription: currentSale.productDescription,
    totalAmount: currentSale.totalAmount,
    downPayment: currentSale.downPayment,
    remainingBalance: currentSale.remainingBalance,
    installmentCount: currentSale.installmentCount,
    installmentAmount: perInstallment,
    warrantyNote: currentSale.warrantyNote || '6 meses de assistência balcão',
    paymentMethod: currentSale.paymentMethod,
    dueDateNote: currentSale.firstDueDate
      ? `Primeiro vencimento: ${currentSale.firstDueDate}`
      : 'Todo dia 10',
  });

  const waUrl = generateWhatsAppUrl(currentSale.clientPhone, receiptMsg);

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptMsg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 pt-4 pb-28 space-y-4">
      {/* Fluxo de Retorno & Seleção de Venda */}
      <div className="flex flex-col gap-2 pb-1">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center gap-1 text-[#64748b] hover:text-[#006194] transition-colors py-1"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-body text-[13px] font-semibold">Voltar para Início</span>
          </button>

          {sales.length > 1 && (
            <select
              value={currentSale.id}
              onChange={e => {
                const found = sales.find(s => s.id === e.target.value);
                if (found) setSelectedSale(found);
              }}
              className="text-xs font-bold text-[#006194] bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {sales.map(s => (
                <option key={s.id} value={s.id}>
                  {s.saleCode} - {s.clientName}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-[24px] sm:text-[28px] text-[#0f172a] font-bold tracking-tight">
              Comprovante & Carnê
            </h1>
            <p className="font-body text-[13px] text-[#64748b] mt-0.5">
              Valores das parcelas, controle de quando foram pagas e recibo para o WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('new_sale')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#006194] text-white text-xs font-bold shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Nova Venda</span>
          </button>
        </div>
      </div>

      {/* Papel do Comprovante (Print-friendly Voucher) */}
      <div className="print-card relative bg-white rounded-xl shadow-md border border-[#cbd5e1] overflow-hidden">
        <div className="h-2 w-full bg-[#006194]"></div>

        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* Header do Recibo */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#006194]">
                <span className="material-symbols-outlined text-[24px]">desktop_windows</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-[17px] text-[#0f172a] font-bold leading-tight">
                  {storeName || 'VTECH'}
                </span>
                <span className="font-body text-[12px] text-[#64748b]">
                  Responsável: {adminName}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="font-headline text-[18px] text-[#006194] font-bold tracking-tight">
                {currentSale.saleCode}
              </span>
              <span className="font-body text-[11px] text-[#64748b]">
                {currentSale.createdAt || 'Hoje'}
              </span>
            </div>
          </div>

          {/* Dados do Comprador */}
          <div className="bg-[#f8fafc] rounded-lg p-3 flex flex-col gap-1 border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="font-body text-[11px] text-[#64748b] uppercase tracking-wider font-bold">
                Comprador
              </span>
              <span className="inline-flex items-center gap-1 font-body text-[11px] text-[#006e2d] font-bold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                WhatsApp Verificado
              </span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="font-headline text-[16px] text-[#0f172a] font-bold">
                {currentSale.clientName}
              </span>
              <span className="font-body text-[13px] text-[#006194] font-semibold font-mono">
                {currentSale.clientPhone}
              </span>
            </div>
            {currentSale.clientSocial && (
              <div className="flex items-center gap-1 text-[#64748b] font-body text-[12px]">
                <span className="material-symbols-outlined text-[14px]">alternate_email</span>
                <span>{currentSale.clientSocial}</span>
              </div>
            )}
          </div>

          {/* Item & Montagem */}
          <div className="flex flex-col gap-1.5">
            <span className="font-body text-[11px] text-[#64748b] uppercase tracking-wider font-bold">
              Setup / Equipamento
            </span>
            <div className="bg-[#faf8ff] rounded-lg p-3 flex flex-col gap-2 border border-[#e2e8f0]">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#006194] text-[20px] mt-0.5 shrink-0">
                  desktop_windows
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline text-[15px] font-bold text-[#0f172a] leading-snug">
                    {currentSale.productDescription}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="bg-white border border-[#cbd5e1] text-[#0f172a] px-2 py-0.5 rounded font-body text-[11px] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-[#006e2d]">
                    verified_user
                  </span>
                  Pronta Entrega / Testado em Bancada
                </span>
                <span className="bg-white border border-[#cbd5e1] text-[#0f172a] px-2 py-0.5 rounded font-body text-[11px] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-[#006194]">
                    schedule
                  </span>
                  {currentSale.warrantyNote || 'Garantia de Balcão'}
                </span>
              </div>
            </div>
          </div>

          {/* Linha Tracejada Divisória */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="w-full border-b-2 border-dashed border-[#cbd5e1]"></div>
            <span className="absolute px-3 bg-white font-body text-[11px] text-[#64748b] uppercase tracking-wider font-bold">
              Condições de Pagamento
            </span>
          </div>

          {/* Valores Totais */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[#64748b] font-body text-[13px]">
              <span>Valor Total Negociado:</span>
              <span className="font-headline text-[18px] text-[#0f172a] font-bold">
                {formatMoney(currentSale.totalAmount)}
              </span>
            </div>

            {currentSale.downPayment > 0 && (
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#dcfce7]/40 border border-[#bbf7d0] text-[#006e2d]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span className="font-body text-[13px] font-bold text-[#0f172a]">
                    Entrada Confirmada (PIX/Sinal):
                  </span>
                </div>
                <span className="font-headline text-[16px] font-bold text-[#006e2d]">
                  - {formatMoney(currentSale.downPayment)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-[#64748b] font-body text-[13px] pt-1">
              <div className="flex flex-col">
                <span className="font-headline text-[15px] font-bold text-[#0f172a]">
                  Saldo Restante:
                </span>
                <span className="font-body text-[11px] text-[#64748b]">
                  {currentSale.paymentMethod === 'promissoria'
                    ? `Promissória / ${currentSale.installmentCount}x parcelas`
                    : `${currentSale.installmentCount}x no carnê/PIX`}
                </span>
              </div>
              <span className="font-headline text-[22px] text-[#006194] font-bold">
                {formatMoney(currentSale.remainingBalance)}
              </span>
            </div>
          </div>

          {/* Cronograma Interativo de Parcelas (com data de pagamento atualizável) */}
          {currentSale.installments && currentSale.installments.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#f1f5f9]">
                <div>
                  <span className="font-body text-[11px] text-[#64748b] uppercase tracking-wider font-bold block">
                    Cronograma das Parcelas ({currentSale.installmentCount}x)
                  </span>
                  <span className="text-[11px] text-[#006194] font-medium">
                    Toque em qualquer parcela para atualizar quando foi paga
                  </span>
                </div>
                <span className="font-body text-[12px] font-bold text-[#0f172a]">
                  {formatMoney(currentSale.installments[0]?.amount || perInstallment)} /mês
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {currentSale.installments.map(inst => {
                  const isPaid = inst.status === 'paid';
                  const isOverdue = inst.status === 'overdue';

                  return (
                    <div
                      key={inst.id}
                      onClick={() => handleOpenInstallmentModal(inst)}
                      className={`cursor-pointer rounded-xl p-3 border transition-all hover:shadow-xs active:scale-[0.99] flex flex-col gap-2 ${
                        isPaid
                          ? 'bg-[#dcfce7]/25 border-[#bbf7d0]'
                          : isOverdue
                          ? 'bg-[#fee2e2]/30 border-[#fecaca]'
                          : 'bg-[#f8fafc] border-[#e2e8f0]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full font-body text-[11px] font-bold flex items-center justify-center shrink-0 ${
                              isPaid
                                ? 'bg-[#006e2d] text-white'
                                : isOverdue
                                ? 'bg-[#ba1a1a] text-white'
                                : 'bg-[#006194] text-white'
                            }`}
                          >
                            {inst.installmentNumber}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-headline text-[14px] font-bold text-[#0f172a]">
                              {inst.installmentNumber}ª Parcela
                            </span>
                            <span className="font-body text-[12px] text-[#64748b]">
                              Vencimento: <strong className="text-[#0f172a]">{inst.dueDate}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-headline text-[16px] font-bold text-[#0f172a]">
                            {formatMoney(inst.amount)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-body text-[11px] font-bold flex items-center gap-1 ${
                              isPaid
                                ? 'bg-[#dcfce7] text-[#15803d]'
                                : isOverdue
                                ? 'bg-[#fee2e2] text-[#ba1a1a]'
                                : 'bg-[#cce5ff] text-[#004b73]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {isPaid ? 'check_circle' : isOverdue ? 'error' : 'schedule'}
                            </span>
                            {isPaid ? 'Paga' : isOverdue ? 'Atrasada' : 'A Vencer'}
                          </span>
                        </div>
                      </div>

                      {/* Payment date display (Quando foi paga) */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9] text-[11px]">
                        {isPaid ? (
                          <span className="text-[#006e2d] font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">event_available</span>
                            Paga em: <strong>{inst.paidAt || 'Hoje'}</strong> ({inst.paidPaymentMethod || 'PIX'})
                          </span>
                        ) : (
                          <span className="text-[#64748b] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
                            Toque para registrar data de pagamento
                          </span>
                        )}

                        <span className="text-[#006194] font-bold flex items-center gap-0.5 hover:underline">
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          Atualizar
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Autenticação & Responsável ADM */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[#64748b] font-body text-[11px] border-t border-[#f1f5f9] gap-1">
            <span>Autenticação: <strong className="font-mono text-[#0f172a]">{currentSale.authenticationCode}</strong></span>
            <span className="flex items-center gap-1 font-semibold text-[#006194]">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Venda Registrada por {adminName}
            </span>
          </div>
        </div>
      </div>

      {/* Caixa Mensagem Formatada Automática (WhatsApp) */}
      <div className="bg-[#f8fafc] rounded-xl p-4 flex flex-col gap-2 border border-[#cbd5e1] no-print">
        <div className="flex items-center justify-between">
          <span className="font-body text-[11px] text-[#006e2d] uppercase tracking-wider font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">chat</span>
            Mensagem Completa para o WhatsApp
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="font-body text-[12px] text-[#006194] hover:underline flex items-center gap-1 font-bold"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
            {copied ? 'Copiado!' : 'Copiar texto'}
          </button>
        </div>

        <pre className="font-mono text-[11px] sm:text-[12px] text-[#334155] whitespace-pre-wrap bg-white p-3 rounded-lg border border-[#e2e8f0] max-h-44 overflow-y-auto leading-relaxed">
          {receiptMsg}
        </pre>
      </div>

      {/* Action Buttons: WhatsApp & Print */}
      <div className="flex flex-col gap-2.5 pt-1 no-print">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-headline text-[15px] font-bold transition-all shadow-md active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[22px]">chat</span>
          <span>Enviar Comprovante no WhatsApp do Cliente</span>
        </a>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full bg-white hover:bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1] py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 font-headline text-[13px] font-bold shadow-xs active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px] text-[#006194]">print</span>
            <span>Imprimir Recibo</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="w-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] py-3 px-3 rounded-xl flex items-center justify-center font-headline text-[13px] font-bold active:scale-[0.98]"
          >
            Voltar ao Início
          </button>
        </div>
      </div>

      {/* Modal: Atualizar Pagamento da Parcela (Data e Valor) */}
      {activeInstallmentForEdit && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveInstallmentForEdit(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-4 border border-[#cbd5e1] animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#006194]/10 text-[#006194] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <div>
                  <h3 className="font-headline text-[16px] text-[#0f172a] font-bold">
                    Atualizar {activeInstallmentForEdit.installmentNumber}ª Parcela
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Vencimento previsto: {activeInstallmentForEdit.dueDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveInstallmentForEdit(null)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Status da Parcela:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEditStatus('paid')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    editStatus === 'paid'
                      ? 'bg-[#dcfce7] text-[#15803d] border-[#15803d]'
                      : 'bg-[#f8fafc] text-[#64748b] border-[#cbd5e1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  <span>Paga</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditStatus('pending')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    editStatus === 'pending'
                      ? 'bg-[#e0f2fe] text-[#0284c7] border-[#0284c7]'
                      : 'bg-[#f8fafc] text-[#64748b] border-[#cbd5e1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                  <span>Pendente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditStatus('overdue')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    editStatus === 'overdue'
                      ? 'bg-[#fee2e2] text-[#ba1a1a] border-[#ba1a1a]'
                      : 'bg-[#f8fafc] text-[#64748b] border-[#cbd5e1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">warning</span>
                  <span>Atrasada</span>
                </button>
              </div>
            </div>

            {/* Data em que foi Paga (Aparece quando status é 'paga') */}
            {editStatus === 'paid' && (
              <div className="space-y-3 p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] animate-in fade-in duration-150">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#15803d] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">event</span>
                      Quando foi paga esta parcela? *
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditPaidDate(new Date().toISOString().split('T')[0])}
                      className="text-[10px] text-[#006194] hover:underline font-bold"
                    >
                      Usar data de hoje
                    </button>
                  </div>
                  <input
                    type="date"
                    required
                    value={editPaidDate}
                    onChange={e => setEditPaidDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#bbf7d0] bg-white font-headline text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#15803d]"
                  />
                </div>

                {/* Forma de Pagamento */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#15803d]">
                    Forma de Pagamento Recebida:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {['PIX', 'Dinheiro', 'Cartão'].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setEditPaymentMethod(method)}
                        className={`py-1.5 px-2 rounded font-bold border text-center transition-colors ${
                          editPaymentMethod === method
                            ? 'bg-[#15803d] text-white border-[#15803d]'
                            : 'bg-white text-[#475569] border-[#cbd5e1]'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Valor da Parcela & Vencimento */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  Valor da Parcela (R$)
                </label>
                <input
                  type="number"
                  step="1"
                  value={editAmount}
                  onChange={e => setEditAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-[#cbd5e1] font-headline text-sm font-bold text-[#006194] bg-[#f8fafc] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  Data de Vencimento
                </label>
                <input
                  type="text"
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-full p-2.5 rounded-lg border border-[#cbd5e1] font-body text-sm font-medium text-[#0f172a] bg-[#f8fafc] focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Observações do Pagamento (Opcional)
              </label>
              <input
                type="text"
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Ex: Comprovante enviado no WhatsApp às 15:30"
                className="w-full p-2 rounded-lg border border-[#cbd5e1] text-xs text-[#0f172a] bg-[#f8fafc] focus:outline-none focus:bg-white"
              />
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveInstallment}
                className="w-full py-3 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-headline text-[14px] font-bold shadow-md active:scale-98"
              >
                Salvar Atualização da Parcela
              </button>

              {editStatus === 'paid' && (
                <button
                  type="button"
                  onClick={() => handleSendInstallmentReceiptWhatsApp(activeInstallmentForEdit)}
                  className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-headline text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Enviar Recibo desta Parcela no WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px] text-[#25D366]">
            check_circle
          </span>
          <span className="font-body text-[13px]">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
