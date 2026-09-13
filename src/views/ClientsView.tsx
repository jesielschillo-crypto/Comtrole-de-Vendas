import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Client } from '../types';
import { formatMoney, generateWhatsAppUrl } from '../utils/formatters';

export const ClientsView: React.FC = () => {
  const { clients, sales, addClient, updateClient, deleteClient, setCurrentView, setSelectedSale } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debt' | 'paid'>('all');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForMessageModal, setClientForMessageModal] = useState<Client | null>(null);
  const [customMsgText, setCustomMsgText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for new client
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientSocial, setClientSocial] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Determine client status and debts
  const clientDataList = clients.map(client => {
    const clientSales = sales.filter(s => s.clientId === client.id || s.clientName === client.name);
    let totalSpent = 0;
    let totalPending = 0;
    let isOverdue = false;
    let latestProduct = client.notes || 'PC Montado / Periféricos';

    if (clientSales.length > 0) {
      clientSales.forEach(s => {
        totalSpent += s.totalAmount;
        const unpaid = s.installments.filter(i => i.status !== 'paid');
        totalPending += unpaid.reduce((sum, inst) => sum + inst.amount, 0);
        if (s.installments.some(i => i.status === 'overdue')) {
          isOverdue = true;
        }
      });
      latestProduct = clientSales[0].productDescription;
    } else {
      // Fallbacks based on notes for seed clients
      if (client.name.includes('Rodrigo')) {
        totalPending = 966;
        totalSpent = 1398;
        isOverdue = true;
        latestProduct = 'Monitor Gamer 24" 165Hz IPS + Headset 7.1';
      } else if (client.name.includes('Matheus')) {
        totalPending = 2000;
        totalSpent = 4390;
        latestProduct = 'PC Gamer Ryzen 5 5600 + RTX 4060';
      } else if (client.name.includes('Camila')) {
        totalPending = 0;
        totalSpent = 1939;
        latestProduct = 'Monitor Curvo 27" 180Hz + Teclado Mecânico RGB';
      } else if (client.name.includes('Felipe')) {
        totalPending = 390;
        totalSpent = 537;
        latestProduct = 'Kit Periféricos: Teclado + Mouse + Mousepad 90x40';
      } else if (client.name.includes('Lucas Silva')) {
        totalPending = 5090;
        totalSpent = 8590;
        isOverdue = true;
        latestProduct = 'PC Gamer High-End Core i7 + RTX 4070';
      }
    }

    const isPaidOff = totalPending <= 0;

    return {
      client,
      clientSales,
      totalSpent,
      totalPending,
      isOverdue,
      isPaidOff,
      latestProduct,
    };
  });

  // Calculate summary top counts
  const totalActiveClients = clients.length;
  const inDebtCount = clientDataList.filter(c => c.totalPending > 0).length;
  const totalDebtAmount = clientDataList.reduce((sum, c) => sum + c.totalPending, 0);
  const totalPaidCount = clientDataList.filter(c => c.isPaidOff).length;

  // Filter clients
  const filteredClients = clientDataList.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.client.name.toLowerCase().includes(term) ||
      item.client.phone.toLowerCase().includes(term) ||
      (item.client.address || '').toLowerCase().includes(term) ||
      (item.client.socialHandle || '').toLowerCase().includes(term) ||
      item.latestProduct.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (filterType === 'debt') return item.totalPending > 0;
    if (filterType === 'paid') return item.isPaidOff;
    return true;
  });

  const handleOpenNewModal = () => {
    setClientName('');
    setClientPhone('');
    setClientAddress('');
    setClientSocial('');
    setClientEmail('');
    setClientNotes('');
    setEditingClient(null);
    setShowNewClientModal(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setClientName(client.name);
    setClientPhone(client.phone);
    setClientAddress(client.address || '');
    setClientSocial(client.socialHandle || '');
    setClientEmail(client.email || '');
    setClientNotes(client.notes || '');
    setEditingClient(client);
    setShowNewClientModal(true);
  };

  const handleSaveClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    if (editingClient) {
      updateClient({
        ...editingClient,
        name: clientName.trim(),
        phone: clientPhone.trim(),
        address: clientAddress.trim(),
        socialHandle: clientSocial.trim(),
        email: clientEmail.trim(),
        notes: clientNotes.trim(),
      });
      showToast('Cliente atualizado com sucesso!');
    } else {
      addClient({
        name: clientName.trim(),
        phone: clientPhone.trim(),
        address: clientAddress.trim(),
        socialHandle: clientSocial.trim() || 'Balcão',
        email: clientEmail.trim(),
        notes: clientNotes.trim(),
      });
      showToast('Cliente cadastrado com sucesso!');
    }

    setShowNewClientModal(false);
  };

  const openWhatsAppMessageDialog = (client: Client, defaultType: 'debt' | 'ready' | 'warranty' | 'general', latestProduct: string, pendingAmount: number) => {
    let msg = '';
    if (defaultType === 'debt') {
      msg = `Olá ${client.name}, tudo bem? Passando para atualizar sua parcela da compra de ${latestProduct} na VTECH no valor de ${formatMoney(pendingAmount)}. Posso te mandar a chave PIX?`;
    } else if (defaultType === 'ready') {
      msg = `Olá ${client.name}! Boas notícias: seu ${latestProduct} está pronto e revisado na bancada da VTECH para retirada ou envio!`;
    } else if (defaultType === 'warranty') {
      msg = `Olá ${client.name}! Tudo bem? Como está o desempenho do seu ${latestProduct}? Qualquer dúvida de suporte ou periféricos adicionais, estamos à disposição!`;
    } else {
      msg = `Olá ${client.name}! Tudo bem? Falo da VTECH.`;
    }

    setCustomMsgText(msg);
    setClientForMessageModal(client);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 pt-4 pb-28 space-y-4">
      {/* Top Banner with Direct Add Client Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-[22px] sm:text-[26px] font-bold text-[#0f172a] tracking-tight">
            Clientes & WhatsApp
          </h1>
          <p className="font-body text-[13px] text-[#64748b]">
            Cadastre contatos e envie mensagens de cobrança e pós-venda direto no WhatsApp.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenNewModal}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-headline text-[13px] font-bold shadow-sm active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Cadastrar Cliente</span>
        </button>
      </div>

      {/* 3 Top Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="flex flex-col p-3 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
          <div className="flex items-center gap-1 text-[#64748b]">
            <span className="material-symbols-outlined text-[16px] text-[#006194]">groups</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-wider">Cadastrados</span>
          </div>
          <span className="font-headline text-[22px] text-[#0f172a] font-bold mt-0.5">
            {totalActiveClients}
          </span>
          <span className="font-body text-[11px] text-[#006e2d] font-semibold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">verified</span> Contatos com Whats
          </span>
        </div>

        <div className="flex flex-col p-3 rounded-xl bg-white border border-[#fecaca] shadow-xs">
          <div className="flex items-center gap-1 text-[#ba1a1a]">
            <span className="material-symbols-outlined text-[16px]">pending_actions</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-wider">
              A Cobrar
            </span>
          </div>
          <span className="font-headline text-[22px] text-[#ba1a1a] font-bold mt-0.5">
            {inDebtCount}
          </span>
          <span className="font-body text-[11px] text-[#ba1a1a] font-medium truncate">
            {formatMoney(totalDebtAmount).replace(',00', '')} em aberto
          </span>
        </div>

        <div className="flex flex-col p-3 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
          <div className="flex items-center gap-1 text-[#006e2d]">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-wider">
              Quitados
            </span>
          </div>
          <span className="font-headline text-[22px] text-[#006e2d] font-bold mt-0.5">
            {totalPaidCount}
          </span>
          <span className="font-body text-[11px] text-[#64748b]">Tudo em dia</span>
        </div>
      </div>

      {/* Fast Search & Filters */}
      <div className="flex flex-col space-y-2">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#94a3b8]">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, WhatsApp, endereço ou PC comprado..."
            className="w-full bg-white text-[#0f172a] placeholder:text-[#94a3b8] pl-10 pr-10 py-2.5 rounded-xl border border-[#cbd5e1] font-body text-[14px] focus:outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/10 transition-all shadow-xs"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-3 flex items-center text-[#94a3b8] hover:text-[#0f172a]"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        {/* Filter Pills / Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar whitespace-nowrap">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`filter-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-body text-[13px] font-semibold transition-all shadow-xs ${
              filterType === 'all'
                ? 'bg-[#006194] text-white'
                : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
            }`}
          >
            <span>Todos os Clientes</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {totalActiveClients}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('debt')}
            className={`filter-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-body text-[13px] font-semibold transition-colors ${
              filterType === 'debt'
                ? 'bg-[#006194] text-white'
                : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            <span>Com Parcelas Pendentes</span>
            <span className="bg-[#fee2e2] text-[#ba1a1a] font-bold px-1.5 py-0.2 rounded-full text-[10px]">
              {inDebtCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('paid')}
            className={`filter-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-body text-[13px] font-semibold transition-colors ${
              filterType === 'paid'
                ? 'bg-[#006194] text-white'
                : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#006e2d]"></span>
            <span>Tudo Pago</span>
            <span className="bg-[#dcfce7] text-[#15803d] font-bold px-1.5 py-0.2 rounded-full text-[10px]">
              {totalPaidCount}
            </span>
          </button>
        </div>
      </div>

      {/* Client Cards List */}
      <div className="flex flex-col space-y-3">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-white border border-[#e2e8f0] rounded-xl shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#006194] mb-2">
              <span className="material-symbols-outlined text-[26px]">person_search</span>
            </div>
            <h4 className="font-headline text-[16px] text-[#0f172a] font-bold">
              Nenhum cliente localizado
            </h4>
            <p className="font-body text-[13px] text-[#64748b] mt-1 max-w-xs">
              Cadastre um novo contato com WhatsApp para manter o histórico de vendas.
            </p>
            <button
              type="button"
              onClick={handleOpenNewModal}
              className="mt-3 px-4 py-2 rounded-xl bg-[#006194] text-white font-body text-[13px] font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Cadastrar Novo Cliente</span>
            </button>
          </div>
        ) : (
          filteredClients.map(item => {
            const { client, clientSales, totalSpent, totalPending, isOverdue, isPaidOff, latestProduct } =
              item;

            let borderClass = 'border-l-[#0284c7]';
            let badgeEl = null;

            if (isOverdue) {
              borderClass = 'border-l-[#ba1a1a]';
              badgeEl = (
                <span className="font-body text-[11px] text-[#ba1a1a] bg-[#fee2e2] border border-[#fecaca] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">warning</span> Atrasado
                </span>
              );
            } else if (isPaidOff) {
              borderClass = 'border-l-[#006e2d]';
              badgeEl = (
                <span className="font-body text-[11px] text-[#15803d] bg-[#dcfce7] border border-[#bbf7d0] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span> Quitado
                </span>
              );
            } else {
              borderClass = 'border-l-[#0284c7]';
              badgeEl = (
                <span className="font-body text-[11px] text-[#0284c7] bg-[#e0f2fe] border border-[#bae6fd] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">schedule</span> Falta {formatMoney(totalPending).replace(',00', '')}
                </span>
              );
            }

            const defaultMsg = isOverdue
              ? `Olá ${client.name}, tudo bem? Passando para atualizar sua parcela da compra de ${latestProduct} na VTECH no valor de ${formatMoney(totalPending)}. Chave PIX: ...`
              : `Olá ${client.name}! Tudo bem? Passando para mandar uma mensagem da VTECH referente ao seu ${latestProduct}!`;

            const waDirectUrl = generateWhatsAppUrl(client.phone, defaultMsg);

            return (
              <div
                key={client.id}
                className={`client-card bg-white rounded-xl p-4 border border-l-4 border-[#e2e8f0] ${borderClass} shadow-xs flex flex-col space-y-3 transition-all`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-headline text-[16px] text-[#0f172a] font-bold truncate">
                        {client.name}
                      </h3>
                      {badgeEl}
                    </div>

                    <div className="flex items-center gap-2 text-[#64748b] font-body text-[13px] mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-[#006e2d] font-bold font-mono">
                        <span className="material-symbols-outlined text-[16px] text-[#25D366]">chat</span>
                        {client.phone}
                      </span>
                      {client.socialHandle && (
                        <>
                          <span>•</span>
                          <span className="truncate text-[#475569]">{client.socialHandle}</span>
                        </>
                      )}
                    </div>

                    {client.address && (
                      <div className="flex items-center gap-1 text-[12px] text-[#64748b] mt-0.5 truncate">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Context Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(client)}
                      title="Editar dados do cliente"
                      className="w-8 h-8 rounded-lg bg-[#f8fafc] text-[#64748b] hover:text-[#006194] flex items-center justify-center border border-[#e2e8f0]"
                    >
                      <span className="material-symbols-outlined text-[17px]">edit</span>
                    </button>
                    {clientSales.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSale(clientSales[0]);
                          setCurrentView('receipt');
                        }}
                        title="Ver comprovante"
                        className="w-8 h-8 rounded-lg bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a] flex items-center justify-center border border-[#e2e8f0]"
                      >
                        <span className="material-symbols-outlined text-[17px]">receipt</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Hardware / Setup box */}
                <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#f1f5f9] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        latestProduct.toLowerCase().includes('monitor')
                          ? 'bg-[#e0f2fe] text-[#0284c7]'
                          : latestProduct.toLowerCase().includes('mouse') || latestProduct.toLowerCase().includes('teclado')
                          ? 'bg-[#fef3c7] text-[#b45309]'
                          : 'bg-[#eff6ff] text-[#006194]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {latestProduct.toLowerCase().includes('monitor')
                          ? 'tv'
                          : latestProduct.toLowerCase().includes('mouse')
                          ? 'mouse'
                          : latestProduct.toLowerCase().includes('teclado')
                          ? 'keyboard'
                          : latestProduct.toLowerCase().includes('fone') || latestProduct.toLowerCase().includes('headset')
                          ? 'headphones'
                          : 'desktop_windows'}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-headline text-[13px] sm:text-[14px] text-[#0f172a] font-semibold truncate">
                        {latestProduct}
                      </span>
                      <span className="font-body text-[11px] text-[#64748b]">
                        {isPaidOff ? 'Totalmente Quitado' : isOverdue ? 'Atrasado' : 'Parcelado Ativo'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span
                      className={`font-body text-[10px] uppercase tracking-wider font-bold block ${
                        isOverdue ? 'text-[#ba1a1a]' : isPaidOff ? 'text-[#006e2d]' : 'text-[#64748b]'
                      }`}
                    >
                      {isOverdue ? 'Falta Pagar' : isPaidOff ? 'Valor Pago' : 'Pendente'}
                    </span>
                    <span
                      className={`font-headline text-[15px] font-bold ${
                        isOverdue ? 'text-[#ba1a1a]' : isPaidOff ? 'text-[#006e2d]' : 'text-[#0f172a]'
                      }`}
                    >
                      {formatMoney(isPaidOff ? totalSpent : totalPending)}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Action Buttons Strip */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 font-headline text-[13px] font-bold transition-colors shadow-xs active:scale-98"
                    href={waDirectUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>{isOverdue ? 'Cobrar WhatsApp' : 'Chamar WhatsApp'}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      openWhatsAppMessageDialog(
                        client,
                        isOverdue ? 'debt' : 'warranty',
                        latestProduct,
                        totalPending
                      )
                    }
                    className="w-full bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#006194] border border-[#cbd5e1] py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 font-headline text-[13px] font-bold transition-colors shadow-xs active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Opções de Mensagem</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Drawer Modal (+ Novo / Editar Cliente) */}
      {showNewClientModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 animate-in fade-in duration-200"
          onClick={() => setShowNewClientModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl p-5 flex flex-col space-y-4 shadow-2xl border-t border-[#e2e8f0] animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#006194]/10 flex items-center justify-center text-[#006194]">
                  <span className="material-symbols-outlined text-[20px]">
                    {editingClient ? 'person' : 'person_add'}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline text-[17px] text-[#0f172a] font-bold">
                    {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
                  </h3>
                  <p className="font-body text-[12px] text-[#64748b]">
                    Contato completo para envio de mensagens no WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveClientSubmit} className="flex flex-col space-y-3">
              <div>
                <label className="font-body text-[11px] text-[#475569] block mb-1 font-bold uppercase tracking-wider">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Ex: Matheus Santos Rocha"
                  className="w-full bg-[#f8fafc] text-[#0f172a] border border-[#cbd5e1] placeholder:text-[#94a3b8] p-2.5 rounded-lg font-body text-[14px] focus:outline-none focus:border-[#006194]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-body text-[11px] text-[#475569] block mb-1 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#25D366]">chat</span>
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-[#f8fafc] text-[#0f172a] border border-[#cbd5e1] placeholder:text-[#94a3b8] p-2.5 rounded-lg font-body text-[14px] focus:outline-none focus:border-[#006194]"
                  />
                </div>
                <div>
                  <label className="font-body text-[11px] text-[#475569] block mb-1 font-bold uppercase tracking-wider">
                    Instagram / Origem
                  </label>
                  <input
                    type="text"
                    value={clientSocial}
                    onChange={e => setClientSocial(e.target.value)}
                    placeholder="@usuario ou Balcão"
                    className="w-full bg-[#f8fafc] text-[#0f172a] border border-[#cbd5e1] placeholder:text-[#94a3b8] p-2.5 rounded-lg font-body text-[14px] focus:outline-none focus:border-[#006194]"
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-[11px] text-[#475569] block mb-1 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#006194]">location_on</span>
                  Endereço / Local de Entrega
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={e => setClientAddress(e.target.value)}
                  placeholder="Ex: Rua das Palmeiras, 120 - Apto 42, São Paulo/SP"
                  className="w-full bg-[#f8fafc] text-[#0f172a] border border-[#cbd5e1] placeholder:text-[#94a3b8] p-2.5 rounded-lg font-body text-[14px] focus:outline-none focus:border-[#006194]"
                />
              </div>

              <div>
                <label className="font-body text-[11px] text-[#475569] block mb-1 font-bold uppercase tracking-wider">
                  PC Montado ou Periférico Comprado / Interesse
                </label>
                <input
                  type="text"
                  value={clientNotes}
                  onChange={e => setClientNotes(e.target.value)}
                  placeholder="Ex: PC Gamer Ryzen 5 5600 + Monitor 24 165Hz"
                  className="w-full bg-[#f8fafc] text-[#0f172a] border border-[#cbd5e1] placeholder:text-[#94a3b8] p-2.5 rounded-lg font-body text-[14px] focus:outline-none focus:border-[#006194]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] font-headline text-[14px] font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-headline text-[14px] font-bold shadow-xs"
                >
                  {editingClient ? 'Salvar Alterações' : 'Salvar Cliente'}
                </button>
              </div>

              {editingClient && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remover ${editingClient.name} do cadastro?`)) {
                      deleteClient(editingClient.id);
                      setShowNewClientModal(false);
                      showToast('Cliente removido.');
                    }
                  }}
                  className="text-xs text-[#ba1a1a] hover:underline text-center pt-1"
                >
                  Excluir este cliente
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal de Escolha e Envio de Mensagem WhatsApp */}
      {clientForMessageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setClientForMessageModal(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl space-y-4 border border-[#cbd5e1]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 text-[#20bd5a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">chat</span>
                </div>
                <div>
                  <h3 className="font-headline text-[16px] text-[#0f172a] font-bold">
                    Enviar WhatsApp para {clientForMessageModal.name}
                  </h3>
                  <p className="text-xs text-[#64748b]">{clientForMessageModal.phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClientForMessageModal(null)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Quick Template Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-[#64748b]">Modelos Rápidos:</span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setCustomMsgText(
                      `Olá ${clientForMessageModal.name}! Passando para avisar que seu PC Gamer / Periférico está pronto na bancada da VTECH para retirada ou entrega!`
                    )
                  }
                  className="p-2 rounded-lg bg-[#f8fafc] hover:bg-[#eff6ff] text-left border border-[#cbd5e1] font-medium"
                >
                  🚀 Pronto p/ Retirada
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomMsgText(
                      `Olá ${clientForMessageModal.name}, tudo bem? Passando para atualizar o lembrete da parcela da sua compra na VTECH. Chave PIX: ...`
                    )
                  }
                  className="p-2 rounded-lg bg-[#f8fafc] hover:bg-[#eff6ff] text-left border border-[#cbd5e1] font-medium"
                >
                  💰 Cobrança Amigável
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomMsgText(
                      `Olá ${clientForMessageModal.name}! Como estão os jogos no seu setup? Qualquer dúvida de garantia ou upgrade de tela/periféricos, estamos por aqui!`
                    )
                  }
                  className="p-2 rounded-lg bg-[#f8fafc] hover:bg-[#eff6ff] text-left border border-[#cbd5e1] font-medium"
                >
                  🛡️ Pós-Venda / Garantia
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomMsgText(
                      `Olá ${clientForMessageModal.name}! Chegaram novidades em monitores 165Hz, mouses ultraleves e teclados mecânicos na VTECH com preços especiais para clientes!`
                    )
                  }
                  className="p-2 rounded-lg bg-[#f8fafc] hover:bg-[#eff6ff] text-left border border-[#cbd5e1] font-medium"
                >
                  🎮 Oferta de Periféricos
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase font-bold text-[#64748b]">Texto da Mensagem:</label>
              <textarea
                rows={4}
                value={customMsgText}
                onChange={e => setCustomMsgText(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#cbd5e1] text-xs leading-relaxed text-[#0f172a] focus:outline-none focus:border-[#25D366] resize-none bg-[#faf8ff]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setClientForMessageModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#f1f5f9] text-[#475569] font-bold text-xs"
              >
                Voltar
              </button>
              <a
                href={generateWhatsAppUrl(clientForMessageModal.phone, customMsgText)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setClientForMessageModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Abrir WhatsApp</span>
              </a>
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
