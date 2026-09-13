import React, { useState } from 'react';
import { Client } from '../types';

interface ClientsViewProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id' | 'totalPending' | 'totalPaid' | 'installmentsPending' | 'status' | 'createdAt'> & {
    email?: string;
    cpf?: string;
    soldItemsSummary?: string;
    totalAmount?: number;
    downPayment?: number;
    installmentsCount?: number;
  }) => void;
  onPayInstallment: (clientId: string, amount: number) => void;
  quickOpenWhatsappClient?: Client | null;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onAddClient,
  onPayInstallment,
  quickOpenWhatsappClient,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'todos' | 'pendentes' | 'quitados'>('todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // WhatsApp modal state
  const [activeWhatsappClient, setActiveWhatsappClient] = useState<Client | null>(
    quickOpenWhatsappClient || null
  );
  const [customMsgType, setCustomMsgType] = useState<'lembrete' | 'hoje' | 'atraso' | 'recibo'>('lembrete');

  // Form states de cadastro de cliente
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newCpf, setNewCpf] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('Blumenau');

  // Dados da Venda inicial no cadastro
  const [newSoldItem, setNewSoldItem] = useState<string>('PC Gamer Craft Ultra i5 + RTX 4060');
  const [newTotalAmount, setNewTotalAmount] = useState<number>(4990);
  const [newDownPayment, setNewDownPayment] = useState<number>(1500);
  const [newInstallmentsCount, setNewInstallmentsCount] = useState<number>(4);

  // KPI Calculations
  const totalClientsCount = clients.length;
  const pendingClientsCount = clients.filter((c) => c.totalPending > 0).length;
  const totalPendingAmount = clients.reduce((acc, c) => acc + c.totalPending, 0);
  const totalPaidAmount = clients.reduce((acc, c) => acc + c.totalPaid, 0);

  // Filtered clients list
  const filtered = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.cpf && c.cpf.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.soldItemsSummary && c.soldItemsSummary.toLowerCase().includes(term));

    if (filterMode === 'pendentes') return matchesSearch && c.totalPending > 0;
    if (filterMode === 'quitados') return matchesSearch && c.totalPending === 0;
    return matchesSearch;
  });

  // Formatadores
  const formatPhone = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };

  const formatCpf = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      alert('Nome e WhatsApp são obrigatórios!');
      return;
    }

    onAddClient({
      name: newName.trim(),
      email: newEmail.trim(),
      cpf: newCpf.trim(),
      phone: newPhone.replace(/\D/g, ''),
      city: newCity.trim() || 'Blumenau',
      handle: `@${newName.toLowerCase().replace(/\s+/g, '')}`,
      source: 'Balcão',
      soldItemsSummary: newSoldItem.trim() || 'PC Gamer / Periféricos',
      totalAmount: Number(newTotalAmount) || 0,
      downPayment: Number(newDownPayment) || 0,
      installmentsCount: Number(newInstallmentsCount) || 1,
    });

    // Reset
    setNewName('');
    setNewEmail('');
    setNewCpf('');
    setNewPhone('');
    setIsAddModalOpen(false);
  };

  const getWhatsappMessage = (client: Client) => {
    const cleanPhone = client.phone.replace(/\D/g, '');
    let msg = '';
    switch (customMsgType) {
      case 'lembrete':
        msg = `Olá ${client.name}, tudo bem? Aqui é da VTECH! Passando para lembrar da sua parcela referente à compra (${client.soldItemsSummary || 'equipamentos de hardware'}). Restante em aberto: R$ ${client.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Qualquer dúvida sobre as formas de pagamento, estamos à disposição!`;
        break;
      case 'hoje':
        msg = `Olá ${client.name}! Sua parcela referente à compra de ${client.soldItemsSummary || 'hardware'} na VTECH vence hoje. Valor restante: R$ ${client.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Qualquer dúvida estamos à disposição!`;
        break;
      case 'atraso':
        msg = `Prezado(a) ${client.name}, identificamos um saldo em aberto de R$ ${client.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} na VTECH. Por favor, entre em contato conosco para alinharmos o pagamento da parcela.`;
        break;
      case 'recibo':
        msg = `Olá ${client.name}! Confirmamos o recebimento da sua parcela na VTECH referente a ${client.soldItemsSummary || 'sua compra'}. Muito obrigado pela preferência!`;
        break;
    }
    return {
      text: msg,
      link: `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`,
    };
  };

  return (
    <div className="space-y-4 pb-28 pt-16 px-4 max-w-xl mx-auto w-full">
      {/* Header & Botão Cadastrar */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Clientes &amp; Parcelamentos</h2>
          <p className="text-xs text-slate-500 leading-snug">
            Veja o que foi vendido, quanto deu de entrada e as parcelas combinadas.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2.5 bg-[#034c70] hover:bg-[#00344f] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Cadastrar Cliente</span>
        </button>
      </div>

      {/* 3 KPI Cards Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* CADASTRADOS */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 text-[#00658c]">
            <span className="material-symbols-outlined text-[16px] shrink-0">groups</span>
            <span className="text-[10px] uppercase font-bold text-slate-600 truncate">Clientes</span>
          </div>
          <div className="my-1">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate block">{totalClientsCount}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-semibold truncate">
            Cadastrados
          </div>
        </div>

        {/* A RECEBER / PENDENTE */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-amber-200 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 text-amber-600">
            <span className="material-symbols-outlined text-[16px] shrink-0">schedule</span>
            <span className="text-[10px] uppercase font-bold text-amber-700 truncate">A Receber</span>
          </div>
          <div className="my-1">
            <span className="text-base sm:text-lg font-extrabold text-amber-700 truncate block">
              R$ {Math.round(totalPendingAmount).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="text-[10px] text-amber-700 font-semibold truncate">
            {pendingClientsCount} c/ parcelas
          </div>
        </div>

        {/* TOTAL RECEBIDO / ENTRADAS */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-emerald-200 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 text-emerald-600">
            <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
            <span className="text-[10px] uppercase font-bold text-emerald-700 truncate">Recebido</span>
          </div>
          <div className="my-1">
            <span className="text-base sm:text-lg font-extrabold text-emerald-700 truncate block">
              R$ {Math.round(totalPaidAmount).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold truncate">
            Entradas &amp; Parc.
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, WhatsApp, CPF ou produto vendido..."
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#00658c] shadow-xs"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterMode('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'todos'
                ? 'bg-[#00344f] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setFilterMode('pendentes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'pendentes'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Com Parcelas ({pendingClientsCount})</span>
          </button>
          <button
            onClick={() => setFilterMode('quitados')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'quitados'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <span>Quitados ({clients.length - pendingClientsCount})</span>
          </button>
        </div>
      </div>

      {/* Lista de Clientes com o que foi vendido, entrada e parcelamento */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <span className="material-symbols-outlined text-slate-400 text-[36px]">person_search</span>
            <p className="text-sm font-bold text-slate-700">Nenhum cliente encontrado</p>
            <p className="text-xs text-slate-500">Tente buscar por outro termo ou cadastre um novo cliente.</p>
          </div>
        ) : (
          filtered.map((client) => {
            const hasDebt = client.totalPending > 0;
            const cleanPhone = client.phone.replace(/\D/g, '');

            return (
              <div
                key={client.id}
                className={`bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 transition-all ${
                  hasDebt ? 'border-l-4 border-l-[#0091C7]' : 'border-l-4 border-l-emerald-500'
                }`}
              >
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">{client.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hasDebt
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {hasDebt ? 'Parcelas Pendentes' : 'Quitado'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">chat</span>
                        {formatPhone(client.phone)}
                      </span>
                      {client.cpf && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">badge</span>
                          CPF: {client.cpf}
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                          {client.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/55${cleanPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors shrink-0"
                    title="Conversar no WhatsApp"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </a>
                </div>

                {/* Bloco de Detalhes da Venda: O que foi vendido, Entrada e Parcelas */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
                  {/* O que foi vendido */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      O que foi vendido:
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#00658c] text-[16px]">desktop_windows</span>
                      <span>{client.soldItemsSummary || 'PC Gamer / Periféricos'}</span>
                    </p>
                  </div>

                  {/* Grid: Entrada, Parcelamento e Saldo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
                    {/* Quanto de Entrada */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center sm:flex-col sm:items-start justify-between min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate">
                        💰 Entrada Paga
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-700 truncate">
                        R$ {(client.downPayment || client.totalPaid || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Quantas Vezes Parcelado */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center sm:flex-col sm:items-start justify-between min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                        💳 Parcelamento
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                        {client.installmentsCount && client.installmentsCount > 1
                          ? `${client.installmentsCount}x de R$ ${(client.installmentValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : 'À Vista'}
                      </span>
                    </div>

                    {/* Saldo Restante / Status */}
                    <div className={`p-2.5 rounded-xl border flex items-center sm:flex-col sm:items-start justify-between min-w-0 ${hasDebt ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${hasDebt ? 'text-amber-800' : 'text-emerald-800'}`}>
                        {hasDebt ? '⏳ Saldo Restante' : '✅ Status'}
                      </span>
                      <span className={`text-xs sm:text-sm font-extrabold truncate ${hasDebt ? 'text-amber-900' : 'text-emerald-900'}`}>
                        {hasDebt
                          ? `R$ ${client.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : 'Quitado'}
                      </span>
                    </div>
                  </div>

                  {hasDebt && client.installmentsPending > 0 && (
                    <p className="text-[11px] text-slate-500 font-medium pt-0.5">
                      Restam <strong>{client.installmentsPending} parcela(s)</strong> pendente(s) de pagamento.
                    </p>
                  )}
                </div>

                {/* Botões de Ação do Card */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <button
                    onClick={() => setActiveWhatsappClient(client)}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Cobrar / Recibo WhatsApp</span>
                  </button>

                  {hasDebt && (
                    <button
                      onClick={() => {
                        const defaultVal = client.installmentValue || (client.totalPending / (client.installmentsPending || 1));
                        const valStr = prompt(
                          `Dar baixa em parcela para ${client.name}\nValor a receber (R$):`,
                          Math.round(defaultVal).toString()
                        );
                        if (valStr) {
                          const num = Number(valStr.replace(',', '.'));
                          if (num > 0) onPayInstallment(client.id, num);
                        }
                      }}
                      className="py-2.5 px-3.5 bg-[#00658c] hover:bg-[#00344f] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                      <span>Receber Parcela</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CADASTRAR CLIENTE (Nome, E-mail, CPF, WhatsApp e Dados da Venda) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00658c] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cadastrar Novo Cliente</h3>
                  <p className="text-[11px] text-slate-500">Nome, E-mail, CPF e WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              {/* DADOS PESSOAIS */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Nome Completo do Cliente *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
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
                    onChange={(e) => setNewPhone(formatPhone(e.target.value))}
                    placeholder="(47) 98861-1619"
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">CPF do Cliente</label>
                  <input
                    type="text"
                    value={newCpf}
                    onChange={(e) => setNewCpf(formatCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">E-mail</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Cidade / UF</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Blumenau - SC"
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm"
                  />
                </div>
              </div>

              {/* DADOS DO QUE FOI VENDIDO, ENTRADA E PARCELAMENTO */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-[11px] font-extrabold uppercase text-[#00658c] tracking-wider">
                  O que foi vendido &amp; Condição de Pagamento
                </p>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">O que foi vendido (Produto / PC)</label>
                  <input
                    type="text"
                    value={newSoldItem}
                    onChange={(e) => setNewSoldItem(e.target.value)}
                    placeholder="Ex: PC Gamer i5 12400F + Monitor 27 + Mousepad Speed"
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl outline-none focus:border-[#00658c] text-sm bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">Valor Total (R$)</label>
                    <input
                      type="number"
                      value={newTotalAmount}
                      onChange={(e) => setNewTotalAmount(Number(e.target.value))}
                      className="w-full h-9 px-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#00658c] text-xs font-bold bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">Entrada Paga (R$)</label>
                    <input
                      type="number"
                      value={newDownPayment}
                      onChange={(e) => setNewDownPayment(Number(e.target.value))}
                      className="w-full h-9 px-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#00658c] text-xs font-bold bg-white text-emerald-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">Parcelado em</label>
                    <select
                      value={newInstallmentsCount}
                      onChange={(e) => setNewInstallmentsCount(Number(e.target.value))}
                      className="w-full h-9 px-2 border border-slate-300 rounded-lg outline-none focus:border-[#00658c] text-xs font-bold bg-white"
                    >
                      <option value="1">1x (À Vista)</option>
                      <option value="2">2x</option>
                      <option value="3">3x</option>
                      <option value="4">4x</option>
                      <option value="5">5x</option>
                      <option value="6">6x</option>
                      <option value="7">7x</option>
                      <option value="8">8x</option>
                      <option value="9">9x</option>
                      <option value="10">10x</option>
                      <option value="11">11x</option>
                      <option value="12">12x</option>
                    </select>
                  </div>
                </div>

                {/* Resumo calculado */}
                {newTotalAmount > newDownPayment && newInstallmentsCount > 1 && (
                  <div className="p-2 bg-blue-50 text-[#00658c] rounded-lg text-[11px] font-semibold">
                    Restante de R$ {(newTotalAmount - newDownPayment).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} dividido em {newInstallmentsCount} parcelas de aprox. R$ {Math.round((newTotalAmount - newDownPayment) / newInstallmentsCount).toLocaleString('pt-BR')}.
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 text-xs hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#034c70] hover:bg-[#00344f] text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TEMPLATES DE MENSAGEM PARA WHATSAPP */}
      {/* ========================================================================= */}
      {activeWhatsappClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-3.5 p-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">chat</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Mensagem WhatsApp</h3>
                  <p className="text-[11px] text-slate-500">
                    {activeWhatsappClient.name} • {formatPhone(activeWhatsappClient.phone)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveWhatsappClient(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Tipo de Mensagem */}
            <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
              <button
                onClick={() => setCustomMsgType('lembrete')}
                className={`py-1.5 px-1 rounded-lg border text-center transition-colors ${
                  customMsgType === 'lembrete'
                    ? 'bg-[#00658c] text-white border-[#00658c]'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Lembrete
              </button>
              <button
                onClick={() => setCustomMsgType('hoje')}
                className={`py-1.5 px-1 rounded-lg border text-center transition-colors ${
                  customMsgType === 'hoje'
                    ? 'bg-[#00658c] text-white border-[#00658c]'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Vence Hoje
              </button>
              <button
                onClick={() => setCustomMsgType('atraso')}
                className={`py-1.5 px-1 rounded-lg border text-center transition-colors ${
                  customMsgType === 'atraso'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Em Atraso
              </button>
              <button
                onClick={() => setCustomMsgType('recibo')}
                className={`py-1.5 px-1 rounded-lg border text-center transition-colors ${
                  customMsgType === 'recibo'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Recibo
              </button>
            </div>

            {/* Preview do Texto */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
              {getWhatsappMessage(activeWhatsappClient).text}
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={getWhatsappMessage(activeWhatsappClient).link}
                target="_blank"
                rel="noreferrer"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Abrir WhatsApp e Enviar</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getWhatsappMessage(activeWhatsappClient).text);
                  alert('Texto copiado para a área de transferência!');
                }}
                className="w-full h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Copiar Texto da Mensagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
