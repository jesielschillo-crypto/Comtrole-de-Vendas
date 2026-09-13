import React from 'react';
import { BellRing, CalendarDays, CheckCircle2, ChevronRight, CreditCard, MessageCircle, ReceiptText, TrendingUp, UserPlus, Users } from 'lucide-react';
import { Client, Product, Sale } from '../types';

interface DashboardViewProps {
  clients: Client[];
  products: Product[];
  sales: Sale[];
  onNavigate: (tab: string) => void;
  onOpenNewSale: () => void;
  onQuickChargeWhatsapp: (client: Client) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  products,
  sales,
  onNavigate,
  onOpenNewSale,
  onQuickChargeWhatsapp,
}) => {
  // Metas e cálculos mensais
  const monthlyGoal = 18000;
  const currentMonthSales = sales?.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0) || 0;
  const goalPercentage = Math.min(100, Math.round((currentMonthSales / monthlyGoal) * 100));

  // A Receber (Parcelas pendentes)
  const totalPending = clients?.reduce((acc, c) => acc + (Number(c.totalPending) || 0), 0) || 0;
  const pendingClients = clients?.filter((c) => (Number(c.totalPending) || 0) > 0) || [];

  // Total já recebido (Entradas + parcelas pagas)
  const totalReceived = clients?.reduce((acc, c) => acc + (Number(c.totalPaid) || 0), 0) || 0;

  // Estoque
  const stockItemsCount = products?.reduce((acc, p) => acc + (Number(p.stockQuantity) || 0), 0) || 0;
  const stockTotalFinal = products?.reduce((acc, p) => acc + ((Number(p.priceCash) || 0) * (Number(p.stockQuantity) || 0)), 0) || 0;
  const stockTotalCost = Math.round(stockTotalFinal * 0.72);

  return (
    <div className="space-y-4 pb-24 pt-16 px-4 max-w-lg mx-auto w-full">
      {/* Botões de Ação Rápida */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {/* + Cadastrar Cliente & Venda */}
        <button
          onClick={onOpenNewSale}
          className="h-22 bg-[#034c70] hover:bg-[#00344f] active:scale-[0.98] text-white rounded-2xl p-3 flex flex-col justify-between shadow-xs transition-all text-left cursor-pointer min-w-0"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <UserPlus size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-extrabold tracking-tight block truncate">
              + Cadastrar &amp; Venda
            </span>
            <span className="text-[10px] text-white/80 block truncate">
              Cliente ➔ Compra ➔ Parcelas
            </span>
          </div>
        </button>

        {/* + Ver Clientes & Cobranças */}
        <button
          onClick={() => onNavigate('clientes')}
          className="h-22 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between shadow-xs transition-all text-left cursor-pointer min-w-0"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00658c] flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-extrabold tracking-tight text-[#00344f] block truncate">
              Clientes &amp; Carnês
            </span>
            <span className="text-[10px] text-slate-500 block truncate">
              {clients.length} cadastrados • Cobranças
            </span>
          </div>
        </button>
      </div>

      {/* CARD 1: VENDAS DO MÊS */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00658c] flex items-center justify-center shrink-0">
              <CreditCard size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs uppercase font-bold text-slate-600 tracking-wider truncate">
                Vendas do Mês
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                Meta: R$ {monthlyGoal.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1 shrink-0">
            <TrendingUp size={14} /> +18%
          </span>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-500 font-bold">R$</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
              {currentMonthSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Barra de Progresso da Meta */}
          <div className="mt-2 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#034c70] h-full rounded-full transition-all duration-500"
              style={{ width: `${goalPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
            <span>Progresso da meta</span>
            <span className="font-bold text-slate-700">{goalPercentage}% atingido</span>
          </div>
        </div>
      </section>

      {/* CARD 2 & 3: GRID COM TOTAL A RECEBER vs VALOR EM ESTOQUE */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total a Receber */}
        <div className="bg-white rounded-2xl p-3.5 border border-amber-200 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-amber-800 truncate">A Receber</span>
              <CalendarDays size={18} className="shrink-0 text-amber-600" />
            </div>
            <div className="text-base sm:text-lg font-extrabold text-amber-900 tracking-tight truncate">
              R$ {Math.round(totalPending).toLocaleString('pt-BR')}
            </div>
            <p className="text-[10px] text-amber-700 mt-0.5 truncate">Parcelas pendentes</p>
          </div>
          <div className="pt-2.5 mt-2 border-t border-amber-100 text-[10px] text-amber-800 flex justify-between items-center gap-1">
            <span className="shrink-0">Clientes:</span>
            <span className="font-bold truncate">{pendingClients.length} com débito</span>
          </div>
        </div>

        {/* Total Já Recebido */}
        <div className="bg-white rounded-2xl p-3.5 border border-emerald-200 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-emerald-800 truncate">Já Recebido</span>
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            </div>
            <div className="text-base sm:text-lg font-extrabold text-emerald-800 tracking-tight truncate">
              R$ {Math.round(totalReceived).toLocaleString('pt-BR')}
            </div>
            <p className="text-[10px] text-emerald-700 mt-0.5 truncate">Entradas e parcelas</p>
          </div>
          <div className="pt-2.5 mt-2 border-t border-emerald-100 text-[10px] text-emerald-800 flex justify-between items-center gap-1">
            <span className="shrink-0">Estoque:</span>
            <span className="font-bold truncate">{stockItemsCount} produtos</span>
          </div>
        </div>
      </div>

      {/* RADAR DE COBRANÇA (QUEM PRECISA PAGAR) */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing size={20} className="text-rose-500" />
            <h3 className="text-xs uppercase font-bold text-slate-800">Radar de Cobrança</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
            {pendingClients.length} cliente(s)
          </span>
        </div>

        {pendingClients.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
            Nenhum cliente com parcelas em aberto. Todos os pagamentos em dia!
          </div>
        ) : (
          <div className="space-y-2">
            {pendingClients.map((client) => (
              <div
                key={client.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{client.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {client.phone} • {client.city}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded truncate">
                      Resta R$ {client.totalPending.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({client.installmentsPending}x)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onQuickChargeWhatsapp(client)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center cursor-pointer"
                    title="Cobrar via WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button
                    onClick={() => onNavigate('clientes')}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="Ver detalhes"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* HISTÓRICO DE VENDAS & PARCELAMENTOS RECENTES */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText size={20} className="text-[#00658c]" />
            <h3 className="text-xs uppercase font-bold text-slate-800">Vendas &amp; Parcelamentos Recentes</h3>
          </div>
          <button
            onClick={onOpenNewSale}
            className="text-xs text-[#00658c] font-bold hover:underline cursor-pointer"
          >
            + Nova Venda
          </button>
        </div>

        {sales.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
            Nenhuma venda registrada ainda. Clique em "+ Nova Venda" para começar!
          </div>
        ) : (
          <div className="space-y-2.5">
            {sales.slice(0, 4).map((sale) => {
              const saleItemsText = sale.items && sale.items.length > 0
                ? sale.items.map((i) => i.name).join(', ')
                : 'Equipamento Customizado';
              const downPayment = Number(sale.downPayment) || 0;
              const totalAmount = Number(sale.totalAmount) || 0;
              const paidCount = Number(sale.paidInstallments) || 0;
              const instVal = Number(sale.installmentValue) || 0;
              const remaining = Math.max(0, totalAmount - downPayment - (paidCount * instVal));
              let formattedDate = '';
              try {
                formattedDate = sale.date ? new Date(sale.date + 'T12:00:00').toLocaleDateString('pt-BR') : '';
              } catch {
                formattedDate = '';
              }

              return (
                <div
                  key={sale.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/70 transition-colors flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {formattedDate}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{saleItemsText}</h4>
                      <p className="text-xs text-slate-600 font-medium truncate">Cliente: {sale.clientName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <p className="text-[10px] text-emerald-700 font-bold truncate">
                        Entrada: R$ {downPayment.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 text-slate-500 gap-2">
                    <span className="flex items-center gap-1 font-semibold text-[#00658c] truncate">
                      <span className="material-symbols-outlined text-[14px] shrink-0">credit_card</span>
                      <span className="truncate">
                        {sale.installmentsCount > 1
                          ? `${sale.installmentsCount}x (${remaining > 0 ? `resta R$ ${remaining.toLocaleString('pt-BR')}` : 'Quitado'})`
                          : 'À Vista'}
                      </span>
                    </span>
                    <span className="capitalize font-medium text-slate-600 shrink-0">
                      {sale.paymentMethod === 'parcelado_loja' ? 'Carnê Loja' : sale.paymentMethod}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
