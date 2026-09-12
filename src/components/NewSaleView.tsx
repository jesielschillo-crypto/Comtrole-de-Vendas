import React, { useState } from 'react';
import { Client, Product, Sale } from '../types';

interface NewSaleViewProps {
  clients: Client[];
  products: Product[];
  selectedProduct?: Product | null;
  onCompleteSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  onAddClientQuick: (client: Omit<Client, 'id' | 'totalPending' | 'totalPaid' | 'installmentsPending' | 'status' | 'createdAt'>) => Client;
  onNavigate?: (tab: string) => void;
}

export const NewSaleView: React.FC<NewSaleViewProps> = ({
  clients,
  products,
  selectedProduct,
  onCompleteSale,
  onAddClientQuick,
  onNavigate,
}) => {
  // Wizard Step: 1 = Cadastrar/Selecionar Cliente, 2 = O que comprou, Entrada e Parcelas
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // STEP 1: Dados do Cliente
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientCpf, setClientCpf] = useState<string>('');
  const [clientCity, setClientCity] = useState<string>('Blumenau');
  const [clientSource, setClientSource] = useState<string>('Balcão');
  const [step1Error, setStep1Error] = useState<string>('');

  // STEP 2: O que comprou
  const [selectedProductId, setSelectedProductId] = useState<string>(
    selectedProduct ? selectedProduct.id : products[0]?.id || ''
  );
  const [customItemName, setCustomItemName] = useState<string>(
    selectedProduct ? selectedProduct.name : products[0]?.name || 'PC Gamer Customizado'
  );
  const [customPrice, setCustomPrice] = useState<number>(
    selectedProduct ? selectedProduct.priceCash : products[0]?.priceCash || 3500
  );

  // STEP 2: O que deu de entrada e o que parcelou
  const [paymentMethod, setPaymentMethod] = useState<'parcelado_loja' | 'pix' | 'cartao'>('parcelado_loja');
  const [downPayment, setDownPayment] = useState<number>(1000);
  const [installmentsCount, setInstallmentsCount] = useState<number>(3);
  const [firstDueDate, setFirstDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [saleNotes, setSaleNotes] = useState<string>('');
  const [stockError, setStockError] = useState<string>('');

  // Modal de Venda Concluída com Recibo WhatsApp
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Formatação de telefone
  const formatPhone = (val: string) => {
    const num = val.replace(/\D/g, '').slice(0, 11);
    if (num.length <= 10) {
      return num.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return num.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };

  // Formatação de CPF
  const formatCpf = (val: string) => {
    const num = val.replace(/\D/g, '').slice(0, 11);
    return num
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Selecionar cliente pré-existente
  const handleSelectExistingClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setStep1Error('');
    if (!clientId) {
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setClientCpf('');
      return;
    }
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setClientName(found.name);
      setClientPhone(found.phone);
      setClientEmail(found.email || '');
      setClientCpf(found.cpf || '');
      setClientCity(found.city || 'Blumenau');
      setClientSource(found.source || 'Cadastro anterior');
    }
  };

  // Selecionar produto da lista
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    if (prodId === 'custom') {
      setCustomItemName('');
      return;
    }
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setCustomItemName(prod.name);
      setCustomPrice(prod.priceCash);
      // Sugere 30% de entrada
      const suggestedDown = Math.round(prod.priceCash * 0.3);
      setDownPayment(suggestedDown);
    }
  };

  // Cálculos financeiros
  const totalAmount = Math.max(0, Number(customPrice) || 0);
  const cleanDownPayment = Math.min(totalAmount, Math.max(0, Number(downPayment) || 0));
  const remainingAmount = Math.max(0, totalAmount - cleanDownPayment);
  
  // Se parcelado na loja: entrada conta como primeira parte
  const actualInstallmentsCount = Math.max(1, Number(installmentsCount) || 1);
  const remainingInstallments = actualInstallmentsCount > 1 ? actualInstallmentsCount - 1 : 1;
  const installmentValue = actualInstallmentsCount > 1 
    ? Math.round((remainingAmount / remainingInstallments) * 100) / 100 
    : remainingAmount;

  // Validação e avanço para Tela 2
  const handleGoToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setStep1Error('Por favor, informe o Nome Completo do cliente.');
      return;
    }
    const cleanP = clientPhone.replace(/\D/g, '');
    if (cleanP.length < 8) {
      setStep1Error('Por favor, informe um WhatsApp ou telefone válido com DDD.');
      return;
    }
    setStep1Error('');
    setCurrentStep(2);
    // Rola para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Conclusão da Venda
  const handleFinalizeSale = (e: React.FormEvent) => {
    e.preventDefault();
    setStockError('');
    if (!clientName.trim()) {
      setCurrentStep(1);
      setStep1Error('Nome do cliente é obrigatório.');
      return;
    }

    const finalItemName = customItemName.trim() || 'PC Gamer Personalizado';
    const selectedStockProduct = products.find(product => product.id === selectedProductId);
    if (selectedStockProduct && selectedStockProduct.stockQuantity < 1) {
      setStockError('Este produto está sem estoque. Atualize a quantidade antes de vender.');
      return;
    }

    // Auto-cria o cliente na base se for novo
    const existing = clients.find(
      (c) => c.name.toLowerCase() === clientName.toLowerCase() || 
             c.phone.replace(/\D/g, '') === clientPhone.replace(/\D/g, '')
    );

    if (!existing) {
      onAddClientQuick({
        name: clientName.trim(),
        phone: clientPhone.replace(/\D/g, ''),
        email: clientEmail.trim(),
        cpf: clientCpf.trim(),
        city: clientCity.trim() || 'Blumenau',
        handle: `@${clientName.toLowerCase().replace(/\s+/g, '')}`,
        source: clientSource || 'Balcão',
      });
    }

    const saleData: Omit<Sale, 'id' | 'date'> = {
      clientName: clientName.trim(),
      clientPhone: clientPhone.replace(/\D/g, ''),
      clientEmail: clientEmail.trim(),
      clientCpf: clientCpf.trim(),
      items: [
        {
          id: selectedProductId || `item-${Date.now()}`,
          name: finalItemName,
          quantity: 1,
          price: totalAmount,
        },
      ],
      totalAmount,
      downPayment: cleanDownPayment,
      paymentMethod,
      installmentsCount: actualInstallmentsCount,
      installmentValue: paymentMethod === 'parcelado_loja' ? installmentValue : 0,
      paidInstallments: paymentMethod === 'parcelado_loja' && cleanDownPayment > 0 ? 1 : actualInstallmentsCount,
      status: paymentMethod === 'parcelado_loja' && remainingAmount > 0 ? 'pendente_pagamento' : 'concluido',
      notes: saleNotes || `Entrada de R$ ${cleanDownPayment.toLocaleString('pt-BR')}. Saldo de R$ ${remainingAmount.toLocaleString('pt-BR')} em ${remainingInstallments}x de R$ ${installmentValue.toLocaleString('pt-BR')}. 1º vencimento em ${firstDueDate}.`,
    };

    onCompleteSale(saleData);

    const savedSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setCompletedSale(savedSale);
  };

  // Reiniciar fluxo
  const handleReset = () => {
    setCompletedSale(null);
    setCurrentStep(1);
    setSelectedClientId('');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setClientCpf('');
    setSaleNotes('');
  };

  return (
    <div className="space-y-4 pb-28 pt-16 px-4 max-w-lg mx-auto w-full">
      {/* Indicador Visual de Passos (Etapa 1 e Etapa 2) */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {/* Passo 1 */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex-1 flex items-center gap-2 p-2 rounded-xl transition-all text-left ${
              currentStep === 1
                ? 'bg-[#034c70] text-white font-bold shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                currentStep === 1 ? 'bg-white text-[#034c70]' : 'bg-slate-200 text-slate-700'
              }`}
            >
              1
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider opacity-80 truncate">Etapa 1</p>
              <p className="text-xs font-bold truncate">Cadastrar Cliente</p>
            </div>
          </button>

          {/* Seta divisória */}
          <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0">
            arrow_forward
          </span>

          {/* Passo 2 */}
          <button
            type="button"
            onClick={() => {
              if (clientName.trim() && clientPhone.trim()) {
                setCurrentStep(2);
              } else {
                setStep1Error('Cadastre o nome e o WhatsApp do cliente primeiro.');
              }
            }}
            className={`flex-1 flex items-center gap-2 p-2 rounded-xl transition-all text-left ${
              currentStep === 2
                ? 'bg-[#034c70] text-white font-bold shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                currentStep === 2 ? 'bg-white text-[#034c70]' : 'bg-slate-200 text-slate-700'
              }`}
            >
              2
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider opacity-80 truncate">Etapa 2</p>
              <p className="text-xs font-bold truncate">Compra &amp; Parcelas</p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TELA 1: CADASTRAR / IDENTIFICAR CLIENTE */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <form onSubmit={handleGoToStep2} className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00658c] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Cadastrar Cliente
                  </h3>
                  <p className="text-xs text-slate-500">
                    Preencha os dados do cliente ou selecione um existente
                  </p>
                </div>
              </div>

              {clients.length > 0 && (
                <div className="relative shrink-0">
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleSelectExistingClient(e.target.value)}
                    className="text-xs font-bold text-[#00658c] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="">Buscar cadastrado...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {step1Error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{step1Error}</span>
              </div>
            )}

            {/* Nome Completo */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-700 block">
                Nome Completo do Cliente <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (step1Error) setStep1Error('');
                  }}
                  placeholder="Ex: Jesiel Schillo"
                  className="w-full h-11 px-3.5 pr-10 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c] focus:ring-2 focus:ring-[#00658c]/15"
                />
                <span className="material-symbols-outlined absolute right-3 text-slate-400 text-[20px] pointer-events-none">
                  badge
                </span>
              </div>
            </div>

            {/* WhatsApp / Celular */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-700 block">
                WhatsApp / Celular <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => {
                    setClientPhone(formatPhone(e.target.value));
                    if (step1Error) setStep1Error('');
                  }}
                  placeholder="(47) 98861-1619"
                  className="w-full h-11 px-3.5 pr-10 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c] focus:ring-2 focus:ring-[#00658c]/15"
                />
                <span className="material-symbols-outlined absolute right-3 text-emerald-600 text-[20px] pointer-events-none">
                  chat
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Usado para enviar o recibo da compra e os lembretes de parcelas.
              </p>
            </div>

            {/* CPF & Cidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700 block">
                  CPF do Cliente
                </label>
                <input
                  type="text"
                  value={clientCpf}
                  onChange={(e) => setClientCpf(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full h-11 px-3.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c] focus:ring-2 focus:ring-[#00658c]/15"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700 block">
                  Cidade / UF
                </label>
                <input
                  type="text"
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  placeholder="Ex: Blumenau - SC"
                  className="w-full h-11 px-3.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c] focus:ring-2 focus:ring-[#00658c]/15"
                />
              </div>
            </div>

            {/* E-mail (Opcional) */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-700 block">
                E-mail (Opcional)
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full h-11 px-3.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c] focus:ring-2 focus:ring-[#00658c]/15"
              />
            </div>
          </div>

          {/* Botão de Avanço para a Outra Tela */}
          <button
            type="submit"
            className="w-full h-13 bg-[#034c70] hover:bg-[#00344f] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Avançar: O que Comprou &amp; Parcelamento</span>
            <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TELA 2: O QUE COMPROU, O QUE DEU DE ENTRADA E O QUE PARCELOU */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <form onSubmit={handleFinalizeSale} className="space-y-4">
          {/* Card Resumo do Cliente Selecionado */}
          <div className="bg-white rounded-2xl p-3.5 border border-blue-200 bg-blue-50/40 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#00658c] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                {clientName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 truncate">{clientName}</p>
                <p className="text-[11px] text-slate-600 truncate">{clientPhone} • {clientCity}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-[#00658c] border border-blue-200 rounded-xl text-xs font-bold shrink-0 transition-colors"
            >
              Alterar Cliente
            </button>
          </div>

          {/* SEÇÃO A: O QUE COMPROU */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#00658c] text-[20px]">desktop_windows</span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. O que comprou
              </h3>
            </div>

            <div className="space-y-1.5">
              {stockError && <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">{stockError}</p>}
              <label className="text-xs font-bold text-slate-700 block">
                Selecionar do Estoque ou Customizado
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#00658c] bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — R$ {p.priceCash.toLocaleString('pt-BR')} (Estoque: {p.stockQuantity})
                  </option>
                ))}
                <option value="custom">✏️ Outro Equipamento / Montagem Personalizada</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Descrição do Item Comprado
              </label>
              <input
                type="text"
                required
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                placeholder="Ex: PC Gamer Ryzen 5 + RTX 3060 + Monitor 24 144Hz"
                className="w-full h-11 px-3.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Valor Total da Compra (R$) <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-bold text-slate-400 text-sm">R$</span>
                <input
                  type="number"
                  min={1}
                  required
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full h-11 pl-10 pr-3.5 border border-slate-300 rounded-xl text-base font-extrabold text-slate-900 outline-none focus:border-[#00658c]"
                />
              </div>
            </div>
          </section>

          {/* SEÇÃO B: O QUE DEU DE ENTRADA */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">payments</span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. O que deu de entrada
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Recebido na Hora
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Valor da Entrada Paga Hoje (R$)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-bold text-emerald-600 text-sm">R$</span>
                <input
                  type="number"
                  min={0}
                  max={totalAmount}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
                  className="w-full h-11 pl-10 pr-3.5 border border-emerald-300 rounded-xl text-base font-extrabold text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-400/20 bg-emerald-50/20"
                />
              </div>
            </div>

            {/* Sugestões Rápidas de Entrada */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Sem entrada', val: 0 },
                { label: '20%', val: Math.round(totalAmount * 0.2) },
                { label: '30%', val: Math.round(totalAmount * 0.3) },
                { label: '50%', val: Math.round(totalAmount * 0.5) },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDownPayment(btn.val)}
                  className="py-1.5 px-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors text-center"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </section>

          {/* SEÇÃO C: O QUE PARCELOU */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00658c] text-[20px]">calendar_month</span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  3. O que parcelou
                </h3>
              </div>
              <span className="text-xs font-bold text-[#00658c] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Carnê da Loja
              </span>
            </div>

            {/* Forma de Pagamento */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'parcelado_loja', label: 'Parcelado Loja', desc: 'Entrada + Carnê' },
                { id: 'pix', label: 'À Vista', desc: 'Integral sem parcelas' },
                { id: 'cartao', label: 'Cartão Crédito', desc: 'Máquina / Débito' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    paymentMethod === m.id
                      ? 'border-[#00658c] bg-blue-50/70 text-[#00344f] font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold">{m.label}</p>
                  <p className="text-[10px] text-slate-500 font-normal">{m.desc}</p>
                </button>
              ))}
            </div>

            {paymentMethod === 'parcelado_loja' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Número de Parcelas do Saldo
                  </label>
                  <select
                    value={installmentsCount}
                    onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-[#00658c]"
                  >
                    <option value={1}>1x (Sem parcelamento)</option>
                    <option value={2}>2x (Entrada + 1 parcela de R$ {Math.round(remainingAmount).toLocaleString('pt-BR')})</option>
                    <option value={3}>3x (Entrada + 2 parcelas de R$ {Math.round(remainingAmount / 2).toLocaleString('pt-BR')})</option>
                    <option value={4}>4x (Entrada + 3 parcelas de R$ {Math.round(remainingAmount / 3).toLocaleString('pt-BR')})</option>
                    <option value={5}>5x (Entrada + 4 parcelas de R$ {Math.round(remainingAmount / 4).toLocaleString('pt-BR')})</option>
                    <option value={6}>6x (Entrada + 5 parcelas de R$ {Math.round(remainingAmount / 5).toLocaleString('pt-BR')})</option>
                    <option value={10}>10x (Entrada + 9 parcelas)</option>
                    <option value={12}>12x (Entrada + 11 parcelas)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    1º Vencimento da Parcela
                  </label>
                  <input
                    type="date"
                    value={firstDueDate}
                    onChange={(e) => setFirstDueDate(e.target.value)}
                    className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c]"
                  />
                </div>

                {/* Painel do Carnê / Simulação Formatada (SEM VAZAR TEXTO) */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-[11px] uppercase font-bold text-[#00658c] tracking-wider">
                    Resumo do Carnê de Pagamento
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Valor Total da Compra:</span>
                      <strong className="text-slate-900">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Entrada Paga Hoje:</span>
                      <strong className="font-extrabold">- R$ {cleanDownPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 font-bold text-[#00658c]">
                      <span>Saldo Parcelado:</span>
                      <span>R$ {remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {remainingAmount > 0 && actualInstallmentsCount > 1 ? (
                    <div className="p-2.5 bg-white rounded-lg border border-blue-200 text-center">
                      <p className="text-xs text-slate-600 font-medium">Condição Acordada:</p>
                      <p className="text-base font-extrabold text-[#034c70]">
                        {remainingInstallments}x de R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        1ª Parcela para {new Date(firstDueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 text-xs font-bold text-center border border-emerald-200">
                      Venda quitada à vista sem parcelas pendentes!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Observações da Venda */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Observações / Garantia (Opcional)
              </label>
              <textarea
                rows={2}
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                placeholder="Ex: Garantia de 1 ano nas peças, parcelas para todo dia 10..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#00658c]"
              />
            </div>
          </section>

          {/* Botões de Ação da Tela 2 */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="h-12 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Voltar</span>
            </button>

            <button
              type="submit"
              className="flex-1 h-12 bg-[#034c70] hover:bg-[#00344f] active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              <span>Concluir Venda &amp; Gerar Recibo</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE RECIBO FINALIZADO COM ENTRADA E PARCELAS */}
      {/* ========================================================================= */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Venda Concluída com Sucesso!</h3>
              <p className="text-xs text-slate-500">Recibo gerado para {completedSale.clientName}</p>
            </div>

            {/* Recibo Formatado para WhatsApp e Comprovante */}
            <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5 font-mono text-slate-800 border border-slate-200">
              <p className="font-bold text-[#00344f] border-b border-slate-200 pb-1">
                PC CRAFT HARDWARE • COMPROVANTE
              </p>
              <p><strong>Cliente:</strong> {completedSale.clientName}</p>
              <p><strong>WhatsApp:</strong> {completedSale.clientPhone}</p>
              <p><strong>Item Comprado:</strong> {completedSale.items[0]?.name}</p>
              <p><strong>Valor Total:</strong> R$ {completedSale.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-emerald-700 font-bold">
                <strong>Entrada Paga:</strong> R$ {completedSale.downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              {completedSale.paymentMethod === 'parcelado_loja' && remainingAmount > 0 ? (
                <p className="text-amber-800 font-bold">
                  <strong>Parcelamento:</strong> {remainingInstallments}x de R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              ) : (
                <p className="text-emerald-700 font-bold">
                  <strong>Condição:</strong> À vista / Quitado
                </p>
              )}
            </div>

            <div className="space-y-2">
              <a
                href={`https://wa.me/55${completedSale.clientPhone}?text=${encodeURIComponent(
                  `*PC CRAFT HARDWARE - RECIBO DE COMPRA*\n\n` +
                  `Olá ${completedSale.clientName}!\n` +
                  `Aqui está o comprovante da sua compra conosco:\n\n` +
                  `🖥️ *O que comprou:* ${completedSale.items[0]?.name}\n` +
                  `💵 *Valor Total:* R$ ${completedSale.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
                  `💰 *Entrada Paga:* R$ ${completedSale.downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
                  (completedSale.paymentMethod === 'parcelado_loja' && remainingAmount > 0
                    ? `📅 *Parcelamento:* ${remainingInstallments}x de R$ ${installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
                    : `✅ *Pagamento:* À Vista / Quitado\n`) +
                  `\nMuito obrigado pela confiança!\nQualquer dúvida estamos à disposição.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>Enviar Recibo &amp; Carnê no WhatsApp</span>
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Nova Venda
                </button>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      setCompletedSale(null);
                      onNavigate('clientes');
                    }}
                    className="flex-1 h-10 bg-blue-50 hover:bg-blue-100 text-[#00658c] rounded-xl text-xs font-semibold"
                  >
                    Ver em Clientes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
