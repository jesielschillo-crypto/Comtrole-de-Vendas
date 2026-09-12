import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { formatMoney, parseMoney } from '../utils/formatters';

export const NewSaleView: React.FC = () => {
  const { clients, inventory, addClient, createSale, setCurrentView } = useApp();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientSocial, setClientSocial] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [downPaymentStr, setDownPaymentStr] = useState('');
  const [selectedInstallments, setSelectedInstallments] = useState(1);
  const [firstDueDate, setFirstDueDate] = useState(() => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    return nextDate.toISOString().split('T')[0];
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promissoria');
  const [sendWhatsAppCheckbox, setSendWhatsAppCheckbox] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Math calculations
  const totalVal = parseMoney(totalAmountStr);
  const downVal = parseMoney(downPaymentStr);
  const remainingVal = Math.max(0, totalVal - downVal);
  const perInstallmentVal =
    selectedInstallments > 0 ? remainingVal / selectedInstallments : 0;

  // Handle choosing existing client
  const handleSelectExistingClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = clients.find(c => c.id === e.target.value);
    if (found) {
      setClientName(found.name);
      setClientPhone(found.phone);
      setClientSocial(found.socialHandle || found.origin || '');
    }
  };

  // Quick select an item from inventory to append to description
  const handleSelectInventoryItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const item = inventory.find(i => i.id === e.target.value);
    if (item) {
      setProductDescription(item.name);
      setTotalAmountStr(item.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || totalVal <= 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      // Find or create client
      let existingClient = clients.find(
        c => c.name.toLowerCase() === clientName.toLowerCase()
      );
      if (!existingClient) {
        existingClient = addClient({
          name: clientName,
          phone: clientPhone,
          socialHandle: clientSocial,
          notes: productDescription,
        });
      }

      // Create Sale
      const newSale = createSale({
        clientId: existingClient.id,
        clientName: clientName,
        clientPhone: clientPhone,
        clientSocial: clientSocial,
        productDescription: productDescription,
        totalAmount: totalVal,
        downPayment: downVal,
        remainingBalance: remainingVal,
        installmentCount: selectedInstallments,
        paymentMethod: paymentMethod,
        firstDueDate: firstDueDate,
        status: remainingVal === 0 ? 'completed' : 'active',
        warrantyNote: '6 meses de assistência balcão (Até 24/04/2025)',
      });

      setIsProcessing(false);
      setCurrentView('receipt');
    }, 700);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 pt-4 pb-28 space-y-4">
      {/* Header Contextual */}
      <div className="flex flex-col space-y-1">
        <button
          type="button"
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex items-center gap-1 text-[#006194] hover:text-[#007bb9] font-body text-[14px] font-bold transition-colors w-fit"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Voltar</span>
        </button>
        <div className="flex flex-col pt-1">
          <h1 className="font-headline text-[24px] sm:text-[28px] text-[#0f172a] font-bold tracking-tight">
            Cadastrar Cliente & Venda
          </h1>
          <p className="font-body text-[13px] text-[#64748b]">
            Cadastre o cliente e calcule as parcelas na hora.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bloco 1: Dados do Comprador */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#006194]">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div>
                <h2 className="font-headline text-[15px] text-[#0f172a] font-bold leading-tight">
                  Dados do Comprador
                </h2>
                <span className="font-body text-[11px] text-[#64748b]">
                  Contato e canal de origem
                </span>
              </div>
            </div>

            {/* Quick existing client selector */}
            <select
              onChange={handleSelectExistingClient}
              className="text-xs font-bold text-[#006194] bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-2.5 py-1.5 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                Puxar do cadastro...
              </option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex flex-col space-y-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold">
                Nome Completo *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full h-12 px-3.5 bg-[#f8fafc] rounded-lg font-body text-[14px] text-[#0f172a] border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
                />
                <span className="material-symbols-outlined absolute right-3 text-[#94a3b8] text-[20px] pointer-events-none">
                  badge
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold">
                WhatsApp / Telefone *
              </label>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="(DDD) 00000-0000"
                  className="w-full h-12 px-3.5 bg-[#f8fafc] rounded-lg font-body text-[14px] text-[#0f172a] border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
                />
                <span
                  className="material-symbols-outlined absolute right-3 text-[#006e2d] text-[20px] pointer-events-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  chat
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold">
                Onde conheceu / Rede Social
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={clientSocial}
                  onChange={e => setClientSocial(e.target.value)}
                  placeholder="Ex: Instagram, TikTok, Indicação..."
                  className="w-full h-12 px-3.5 bg-[#f8fafc] rounded-lg font-body text-[14px] text-[#0f172a] border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
                />
                <span className="material-symbols-outlined absolute right-3 text-[#94a3b8] text-[20px] pointer-events-none">
                  tag
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 2: Equipamento ou Peça */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#006194]">
                <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
              </div>
              <div>
                <h2 className="font-headline text-[15px] text-[#0f172a] font-bold leading-tight">
                  PC Montado ou Periféricos
                </h2>
                <span className="font-body text-[11px] text-[#64748b]">
                  Computador montado, tela, mouse, teclado ou fone
                </span>
              </div>
            </div>

            <span className="bg-[#dcfce7] text-[#15803d] font-body text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#bbf7d0]">
              Pronta Entrega
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold">
                Descrição do PC ou Periféricos *
              </label>
              {/* Load from stock */}
              <select
                onChange={handleSelectInventoryItem}
                className="text-xs text-[#006194] bg-white border border-[#cbd5e1] rounded px-2 py-1 font-medium focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Carregar do Catálogo...
                </option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({formatMoney(item.salePrice)})
                  </option>
                ))}
              </select>
            </div>

            <textarea
              rows={2}
              required
              value={productDescription}
              onChange={e => setProductDescription(e.target.value)}
              placeholder="Ex: PC Gamer Ryzen 5 5600 + RTX 4060"
              className="w-full p-3 bg-[#f8fafc] rounded-lg font-body text-[14px] text-[#0f172a] border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194] resize-none"
            />

            <div className="flex flex-col space-y-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold">
                Valor Total da Venda *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-[#006194] font-headline text-[18px] font-bold">
                  R$
                </div>
                <input
                  type="text"
                  required
                  value={totalAmountStr}
                  onChange={e => setTotalAmountStr(e.target.value)}
                  placeholder="0,00"
                  className="w-full h-14 pl-12 pr-4 bg-[#f8fafc] rounded-lg font-headline text-[22px] font-bold text-[#006194] border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194] tracking-tight"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 3: Pagamento e Parcelamento */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#007230]">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
            <div>
              <h2 className="font-headline text-[15px] text-[#0f172a] font-bold leading-tight">
                Plano de Pagamento
              </h2>
              <span className="font-body text-[11px] text-[#64748b]">
                Entrada & cálculo automático
              </span>
            </div>
          </div>

          {/* Valor de Entrada */}
          <div className="flex flex-col space-y-1">
            <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold">
              Valor de Entrada (Sinal)
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-[#0f172a] font-headline text-[16px] font-bold">
                R$
              </div>
              <input
                type="text"
                value={downPaymentStr}
                onChange={e => setDownPaymentStr(e.target.value)}
                placeholder="0,00"
                className="w-full h-12 pl-12 pr-28 bg-[#f8fafc] rounded-lg font-headline text-[17px] font-bold text-[#0f172a] border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
              />
              <span className="absolute right-3 text-[#006e2d] font-body text-[11px] font-bold bg-[#dcfce7] border border-[#bbf7d0] px-2 py-0.5 rounded">
                PIX Recebido
              </span>
            </div>
          </div>

          {/* Seletor Rápido de Parcelas */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold">
                Quantidade de Parcelas
              </label>
              <span className="font-body text-[11px] text-[#006194] font-bold">
                Sem juros direto na loja
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 6, 10].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedInstallments(p)}
                  className={`h-10 rounded-lg font-headline text-[14px] font-bold transition-all ${
                    selectedInstallments === p
                      ? 'bg-[#006194] text-white shadow-xs'
                      : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                  }`}
                >
                  {p}x
                </button>
              ))}
            </div>
          </div>

          {/* Card de Resumo Automático e Transparente */}
          <div className="bg-[#f8fafc] rounded-xl p-4 space-y-3 border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="font-body text-[13px] text-[#64748b]">Restante a Parcelar</span>
              <span className="font-headline text-[18px] font-bold text-[#0f172a] tracking-tight">
                {formatMoney(remainingVal)}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#cbd5e1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[#006e2d] text-[22px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span className="font-body text-[13px] text-[#0f172a] font-medium">Condição</span>
              </div>
              <div className="text-right">
                <span className="font-headline text-[18px] font-bold text-[#006e2d]">
                  {selectedInstallments}x de {formatMoney(perInstallmentVal)}
                </span>
                <span className="block font-body text-[11px] text-[#64748b]">sem acréscimo</span>
              </div>
            </div>

            {/* Primeiro Vencimento */}
            <div className="flex flex-col space-y-1 pt-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold">
                Primeiro Vencimento
              </label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={firstDueDate}
                  onChange={e => setFirstDueDate(e.target.value)}
                  className="w-full h-11 px-3 bg-white rounded-lg font-body text-[14px] text-[#0f172a] border border-[#cbd5e1] focus:outline-none focus:border-[#006194]"
                />
              </div>
            </div>

            {/* Método de Acordo */}
            <div className="flex flex-col space-y-1.5 pt-1">
              <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold">
                Método de Acordo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'promissoria', label: 'Promissória', icon: 'assignment' },
                  { id: 'pix_mensal', label: 'PIX Mensal', icon: 'qr_code_2' },
                  { id: 'boleto', label: 'Boleto', icon: 'receipt_long' },
                ].map(item => {
                  const isSelected = paymentMethod === item.id;
                  return (
                    <label
                      key={item.id}
                      onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg text-center cursor-pointer transition-colors border ${
                        isSelected
                          ? 'bg-white border-[#006194] shadow-xs'
                          : 'bg-white border-[#cbd5e1] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isSelected ? 'text-[#006194]' : 'text-[#64748b]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`font-body text-[11px] font-bold mt-1 ${
                          isSelected ? 'text-[#0f172a]' : 'text-[#64748b]'
                        }`}
                      >
                        {item.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 4: Envio Automático WhatsApp */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div className="relative flex items-center pt-0.5">
              <input
                type="checkbox"
                checked={sendWhatsAppCheckbox}
                onChange={e => setSendWhatsAppCheckbox(e.target.checked)}
                className="w-5 h-5 rounded border-[#cbd5e1] text-[#006e2d] focus:ring-0 cursor-pointer accent-[#006e2d]"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline text-[14px] font-bold text-[#0f172a]">
                  Enviar recibo & lembretes no WhatsApp
                </span>
                <span
                  className="material-symbols-outlined text-[#006e2d] text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  send
                </span>
              </div>
              <p className="font-body text-[12px] text-[#64748b] mt-0.5">
                Dispara automaticamente o cronograma de vencimentos e o termo de garantia após salvar.
              </p>
            </div>
          </label>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col space-y-2 pt-2">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full h-14 bg-[#006e2d] hover:bg-[#005a24] text-white rounded-xl font-headline text-[16px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined text-[24px] animate-spin">sync</span>
                <span>Processando Venda...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[24px]">save</span>
                <span>Salvar Cliente e Gerar Parcelas</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="w-full h-11 bg-transparent text-[#64748b] rounded-lg font-body text-[13px] font-bold hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors flex items-center justify-center"
          >
            Descartar
          </button>
        </div>
      </form>
    </div>
  );
};
