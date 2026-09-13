import React from 'react';
import { useApp } from '../context/AppContext';
import { formatMoney, generateWhatsAppUrl, generateReminderText } from '../utils/formatters';

export const DashboardView: React.FC = () => {
  const { sales, inventory, setCurrentView, setSelectedSale, adminName, currentUser } = useApp();

  // Dynamic calculations based on state
  const totalSalesAmount = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalToReceive = sales.reduce((acc, s) => {
    const pendingInstallments = s.installments.filter(i => i.status !== 'paid');
    return acc + pendingInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  }, 0);

  const pendingClientsCount = new Set(
    sales
      .filter(s => s.installments.some(i => i.status !== 'paid'))
      .map(s => s.clientId)
  ).size;

  const totalCostStock = inventory.reduce((acc, item) => acc + item.costPrice * item.quantity, 0);
  const totalSaleStock = inventory.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);

  // Overdue installments
  const overdueSales = sales.filter(s =>
    s.installments.some(i => i.status === 'overdue')
  );

  // Low stock items (quantity <= 2)
  const lowStockItems = inventory.filter(item => item.quantity <= 2);

  // Today formatted in Portuguese
  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });

  // Open receipt for a sale
  const handleViewReceipt = (sale: (typeof sales)[0]) => {
    setSelectedSale(sale);
    setCurrentView('receipt');
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto px-2 sm:px-4 pt-4 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Top status & Greeting */}
      <section className="flex flex-col gap-1 bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#006e2d] animate-pulse"></span>
            <span className="font-body text-[11px] uppercase tracking-wider text-[#006e2d] font-bold">
              Bancada Técnica Aberta
            </span>
            <span className="text-xs text-[#94a3b8]">•</span>
            <span className="text-xs text-[#64748b] hidden sm:inline">
              {currentUser?.storeName || 'VTECH'}
            </span>
          </div>
          <span className="font-body text-[12px] text-[#64748b] font-medium capitalize">
            {todayFormatted}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('profile')}
              className="w-12 h-12 rounded-2xl overflow-hidden bg-[#006194] hover:bg-[#0284c7] text-white flex items-center justify-center font-bold font-headline text-sm shadow-sm shrink-0 transition-transform active:scale-95 border-2 border-white ring-2 ring-[#006194]/20"
              title="Abrir Meu Perfil"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={adminName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{adminName.slice(0, 2).toUpperCase()}</span>
              )}
            </button>
            <div>
              <h1 className="font-headline text-[22px] sm:text-[26px] text-[#0f172a] font-bold tracking-tight">
                Olá, <span className="text-[#006194]">{adminName}</span>
              </h1>
              <p className="text-xs text-[#64748b]">
                Painel de Controle • Gestão de estoque, vendas e carnê
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCurrentView('profile')}
              className="px-3 py-1.5 rounded-xl border border-[#cbd5e1] hover:bg-[#f8fafc] text-xs font-bold text-[#475569] flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#006194]">account_circle</span>
              <span>Meu Perfil</span>
            </button>
            <span className="font-body text-[11px] text-[#006e2d] bg-[#dcfce7] border border-[#bbf7d0] px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              <span>Sessão Ativa</span>
            </span>
          </div>
        </div>
      </section>

      {/* Quick Action Buttons */}
      <section className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setCurrentView('new_sale')}
          className="group relative overflow-hidden bg-[#006194] hover:bg-[#0284c7] text-white rounded-xl p-3.5 flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">point_of_sale</span>
          <span className="font-headline text-[15px] sm:text-[16px] font-bold leading-tight">
            + Nova Venda
          </span>
        </button>

        <button
          onClick={() => setCurrentView('new_item')}
          className="group relative overflow-hidden bg-white hover:bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1] rounded-xl p-3.5 flex items-center justify-center gap-2.5 shadow-sm active:scale-95 transition-all"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px] text-[#006194]">desktop_windows</span>
          <span className="font-headline text-[15px] sm:text-[16px] font-bold leading-tight">
            + Cadastrar PC / Periférico
          </span>
        </button>
      </section>

      {/* Financial Metrics Cards */}
      <section className="flex flex-col gap-3">
        {/* Monthly Sales Card */}
        <div className="relative overflow-hidden bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#cce5ff] flex items-center justify-center text-[#006194]">
                <span className="material-symbols-outlined text-[22px]">payments</span>
              </div>
              <div>
                <span className="font-body text-[11px] uppercase tracking-wider text-[#64748b] block font-bold">
                  Vendas do Mês
                </span>
                <span className="font-body text-[12px] text-[#64748b]">
                  Meta mensal: R$ 18.000
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-body text-[12px] font-bold border border-[#bbf7d0]">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +18%
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div className="font-headline text-[32px] text-[#0f172a] font-bold tracking-tight">
              <span className="text-[18px] text-[#64748b] font-medium mr-1">R$</span>
              {totalSalesAmount.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              <span className="text-[18px] text-[#64748b]">,00</span>
            </div>
          </div>

          <div className="w-full bg-[#f1f5f9] h-2 rounded-full mt-3 overflow-hidden border border-[#e2e8f0]">
            <div
              className="bg-[#006194] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((totalSalesAmount / 18000) * 100))}%` }}
            ></div>
          </div>
        </div>

        {/* 2 Sub-metrics (A Receber & Em Estoque) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total a Receber */}
          <div className="bg-white rounded-xl p-3.5 flex flex-col justify-between border border-[#e2e8f0] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-[11px] uppercase tracking-wider text-[#64748b] font-bold">
                Total a Receber
              </span>
              <span className="material-symbols-outlined text-[#0284c7] text-[20px]">
                calendar_month
              </span>
            </div>
            <div className="my-1">
              <span className="font-headline text-[22px] text-[#0f172a] block font-bold">
                {formatMoney(totalToReceive).replace(',00', '')}
              </span>
              <span className="font-body text-[12px] text-[#64748b] block">
                Parcelas em aberto
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#f1f5f9] flex items-center justify-between">
              <span className="font-body text-[11px] text-[#64748b]">Pendentes:</span>
              <span className="font-body text-[11px] font-bold text-[#006194]">
                {pendingClientsCount} clientes
              </span>
            </div>
          </div>

          {/* Valor em Estoque */}
          <div className="bg-white rounded-xl p-3.5 flex flex-col justify-between border border-[#e2e8f0] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-[11px] uppercase tracking-wider text-[#64748b] font-bold">
                Valor em Estoque
              </span>
              <span className="material-symbols-outlined text-[#006e2d] text-[20px]">
                inventory_2
              </span>
            </div>
            <div className="my-1">
              <span className="font-headline text-[22px] text-[#0f172a] block font-bold">
                {formatMoney(totalCostStock).replace(',00', '')}
              </span>
              <span className="font-body text-[12px] text-[#64748b] block">
                Custo de PCs e periféricos
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#f1f5f9] flex items-center justify-between">
              <span className="font-body text-[11px] text-[#64748b]">Preço final:</span>
              <span className="font-body text-[11px] font-bold text-[#006e2d]">
                {formatMoney(totalSaleStock).replace(',00', '')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Radar de Quem Precisa Pagar */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">
              notification_important
            </span>
            <h2 className="font-headline text-[17px] text-[#0f172a] font-bold">
              Radar de Quem Precisa Pagar
            </h2>
          </div>
          <span className="font-body text-[11px] px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#ba1a1a] font-bold border border-[#fecaca]">
            {overdueSales.length} {overdueSales.length === 1 ? 'atrasada' : 'atrasadas'}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {overdueSales.length > 0 ? (
            overdueSales.map(sale => {
              const overdueInst =
                sale.installments.find(i => i.status === 'overdue') || sale.installments[0];
              const reminderMsg = generateReminderText({
                clientName: sale.clientName,
                productDescription: sale.productDescription,
                installmentNumber: overdueInst.installmentNumber,
                totalInstallments: sale.installmentCount,
                amount: overdueInst.amount,
                dueDate: overdueInst.dueDate,
                isOverdue: true,
              });
              const waLink = generateWhatsAppUrl(sale.clientPhone, reminderMsg);

              return (
                <div
                  key={sale.id}
                  className="bg-white rounded-xl p-3.5 border-l-4 border-l-[#ba1a1a] border border-[#e2e8f0] shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-9 h-9 rounded-lg bg-[#fee2e2] text-[#ba1a1a] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">
                          person_alert
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-headline text-[15px] text-[#0f172a] font-bold">
                            {sale.clientName}
                          </span>
                          <span className="font-body text-[11px] text-[#ba1a1a] bg-[#fee2e2] px-1.5 py-0.5 rounded font-bold">
                            Venceu {overdueInst.dueDate}
                          </span>
                        </div>
                        <span className="font-body text-[13px] text-[#64748b]">
                          Parcela {overdueInst.installmentNumber}/{sale.installmentCount} •{' '}
                          {sale.productDescription}
                        </span>
                        <span className="font-headline text-[17px] text-[#0f172a] font-bold mt-1">
                          {formatMoney(overdueInst.amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <a
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 font-headline text-[14px] font-bold transition-colors shadow-sm active:scale-98"
                      href={waLink}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      Cobrar no WhatsApp
                    </a>
                    <button
                      aria-label="Ver comprovante"
                      onClick={() => handleViewReceipt(sale)}
                      className="w-10 h-10 shrink-0 bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg flex items-center justify-center text-[#475569] transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">receipt</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-3 bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] text-center text-[#15803d] text-xs font-medium">
              Nenhuma parcela atrasada hoje! Todos os pagamentos estão em dia.
            </div>
          )}

          {/* Estoque Baixo Alert */}
          {lowStockItems.length > 0 && (
            <div
              onClick={() => setCurrentView('inventory')}
              className="cursor-pointer bg-white rounded-xl p-3.5 border-l-4 border-l-[#f59e0b] border border-[#e2e8f0] shadow-sm flex items-center justify-between hover:bg-[#fafaf9] transition-colors"
            >
              <div className="flex gap-2.5 items-start">
                <div className="w-9 h-9 rounded-lg bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline text-[15px] text-[#0f172a] font-bold">
                      Estoque Baixo
                    </span>
                    <span className="font-body text-[11px] text-[#b45309] bg-[#fef3c7] px-1.5 py-0.5 rounded font-bold">
                      Atenção
                    </span>
                  </div>
                  <p className="font-body text-[13px] text-[#64748b] mt-0.5">
                    {lowStockItems.slice(0, 3).map((item, idx) => (
                      <span key={item.id}>
                        {item.name} (<span className="text-[#ba1a1a] font-bold">{item.quantity} un</span>)
                        {idx < Math.min(2, lowStockItems.length - 1) ? ' • ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
              <button
                aria-label="Ver estoque"
                className="w-9 h-9 rounded-lg bg-[#f1f5f9] text-[#006194] flex items-center justify-center transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Últimas Vendas */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#006194] text-[20px]">
              receipt_long
            </span>
            <h2 className="font-headline text-[17px] text-[#0f172a] font-bold">
              Últimas Vendas
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('clients')}
            className="font-body text-[12px] text-[#006194] hover:underline font-bold transition-colors"
            type="button"
          >
            Ver todas
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {sales.length > 0 ? (
            sales.slice(0, 4).map(sale => (
              <div
                key={sale.id}
                onClick={() => handleViewReceipt(sale)}
                className="cursor-pointer bg-white rounded-xl p-3 flex items-center justify-between border border-[#e2e8f0] shadow-sm hover:border-[#006194]/40 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#006194] shrink-0">
                    <span className="material-symbols-outlined text-[22px]">
                      {sale.productDescription.toLowerCase().includes('cooler')
                        ? 'build_circle'
                        : sale.productDescription.toLowerCase().includes('geforce') ||
                          sale.productDescription.toLowerCase().includes('rtx')
                        ? 'videogame_asset'
                        : 'desktop_windows'}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline text-[14px] sm:text-[15px] text-[#0f172a] font-bold truncate">
                      {sale.productDescription}
                    </span>
                    <span className="font-body text-[13px] text-[#64748b] truncate">
                      {sale.clientName}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`font-body text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          sale.paymentMethod === 'pix_vista'
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : sale.paymentMethod === 'cartao'
                            ? 'bg-[#f1f5f9] text-[#334155]'
                            : 'bg-[#fef3c7] text-[#b45309]'
                        }`}
                      >
                        {sale.paymentMethod === 'pix_vista'
                          ? 'Pago via PIX'
                          : sale.paymentMethod === 'cartao'
                          ? `${sale.installmentCount}x no Cartão`
                          : 'Promissória Pendente'}
                      </span>
                      <span className="font-body text-[11px] text-[#94a3b8]">
                        {sale.createdAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="font-headline text-[15px] sm:text-[16px] font-bold text-[#0f172a] block">
                    {formatMoney(sale.totalAmount)}
                  </span>
                  <span
                    className={`font-body text-[11px] font-bold ${
                      sale.status === 'completed'
                        ? 'text-[#006e2d]'
                        : 'text-[#b45309]'
                    }`}
                  >
                    {sale.status === 'completed'
                      ? 'À vista'
                      : `${sale.installments.filter(i => i.status === 'paid').length}/${
                          sale.installmentCount
                        } pago`}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-6 border border-dashed border-[#cbd5e1] text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-11 h-11 rounded-xl bg-[#eff6ff] text-[#006194] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">point_of_sale</span>
              </div>
              <div>
                <p className="font-headline text-[14px] font-bold text-[#0f172a]">
                  Nenhuma venda registrada ainda
                </p>
                <p className="text-xs text-[#64748b]">
                  O sistema está zerado. Cadastre seus PCs montados e clientes para começar a registrar vendas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView('new_sale')}
                className="mt-1 px-4 py-2 rounded-lg bg-[#006194] text-white text-xs font-bold shadow-xs active:scale-95"
              >
                + Registrar Primeira Venda
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
