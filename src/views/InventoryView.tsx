import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory, InventoryItem } from '../types';
import { formatMoney } from '../utils/formatters';

export const InventoryView: React.FC = () => {
  const { inventory, setCurrentView, adjustQuantity, updateInventoryItem, deleteInventoryItem } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItemForSheet, setActiveItemForSheet] = useState<InventoryItem | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick edit modal states
  const [editingPriceItem, setEditingPriceItem] = useState<InventoryItem | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Category counts
  const categoryCounts: Record<string, number> = {
    all: inventory.reduce((sum, item) => sum + item.quantity, 0),
    pc_montado: inventory.filter(i => i.category === 'pc_montado').reduce((sum, i) => sum + i.quantity, 0),
    monitor: inventory.filter(i => i.category === 'monitor').reduce((sum, i) => sum + i.quantity, 0),
    mouse: inventory.filter(i => i.category === 'mouse').reduce((sum, i) => sum + i.quantity, 0),
    mousepad: inventory.filter(i => i.category === 'mousepad').reduce((sum, i) => sum + i.quantity, 0),
    teclado: inventory.filter(i => i.category === 'teclado').reduce((sum, i) => sum + i.quantity, 0),
    headset: inventory.filter(i => i.category === 'headset').reduce((sum, i) => sum + i.quantity, 0),
    kit_completo: inventory.filter(i => i.category === 'kit_completo').reduce((sum, i) => sum + i.quantity, 0),
  };

  const categories = [
    { id: 'all', label: 'Todos', icon: 'grid_view', count: categoryCounts.all },
    { id: 'pc_montado', label: 'PCs Montados', icon: 'desktop_windows', count: categoryCounts.pc_montado },
    { id: 'monitor', label: 'Monitores / Telas', icon: 'tv', count: categoryCounts.monitor },
    { id: 'mouse', label: 'Mouses', icon: 'mouse', count: categoryCounts.mouse },
    { id: 'mousepad', label: 'Mousepads', icon: 'layers', count: categoryCounts.mousepad },
    { id: 'teclado', label: 'Teclados', icon: 'keyboard', count: categoryCounts.teclado },
    { id: 'headset', label: 'Headsets / Fones', icon: 'headphones', count: categoryCounts.headset },
    { id: 'kit_completo', label: 'Kits Setup', icon: 'devices', count: categoryCounts.kit_completo },
  ];

  const filteredItems = inventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.locationNote || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.specs?.cpu || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.specs?.gpu || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalStockUnits = inventory.reduce((sum, i) => sum + i.quantity, 0);

  const getCategoryBadge = (cat: ProductCategory) => {
    switch (cat) {
      case 'pc_montado':
        return { label: 'PC Montado', color: 'bg-[#eff6ff] text-[#006194] border-[#bfdbfe]' };
      case 'monitor':
        return { label: 'Monitor / Tela', color: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]' };
      case 'mouse':
        return { label: 'Mouse', color: 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]' };
      case 'mousepad':
        return { label: 'Mousepad', color: 'bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff]' };
      case 'teclado':
        return { label: 'Teclado', color: 'bg-[#ffedd5] text-[#c2410c] border-[#fed7aa]' };
      case 'headset':
        return { label: 'Headset / Fone', color: 'bg-[#e0e7ff] text-[#4338ca] border-[#c7d2fe]' };
      case 'kit_completo':
        return { label: 'Kit Completo', color: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]' };
      default:
        return { label: 'Produto', color: 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]' };
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto min-h-screen bg-[#faf8ff] pb-28">
      {/* Search & Scan Header */}
      <div className="px-4 pt-4 pb-2 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748b]">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar PC montado, tela, mouse, teclado, fone..."
              className="w-full pl-10 pr-10 py-2.5 bg-white text-[#0f172a] placeholder-[#94a3b8] font-body text-[14px] rounded-xl border border-[#cbd5e1] focus:outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/20 shadow-sm transition-all"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748b] hover:text-[#0f172a]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowScannerModal(true)}
            title="Escanear Código do Equipamento"
            className="w-11 h-11 flex items-center justify-center bg-white text-[#006194] border border-[#cbd5e1] hover:bg-[#f8fafc] active:scale-95 rounded-xl shadow-sm transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">barcode_scanner</span>
          </button>
        </div>

        {/* Category Scrollable Chips (PCs, Telas, Mouses, Mousepads, Teclados, Fones, Kits) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
          {categories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`category-chip shrink-0 px-3.5 py-1.5 rounded-full font-body text-[13px] flex items-center gap-1.5 transition-all active:scale-95 ${
                  isActive
                    ? 'bg-[#006194] text-white font-bold shadow-sm'
                    : 'bg-white text-[#475569] border border-[#cbd5e1] hover:bg-[#f1f5f9] font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="ml-0.5 opacity-80 text-xs">({cat.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Metric Strip */}
      <div className="px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006e2d]"></span>
          <span className="font-body text-[13px] text-[#334155] font-semibold">
            {totalStockUnits} PCs & periféricos prontos para entrega
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#64748b] font-body text-[12px]">
          <span className="material-symbols-outlined text-[15px] text-[#006194]">
            verified
          </span>
          <span>Pronta Entrega</span>
        </div>
      </div>

      {/* Product List */}
      <div className="px-4 py-2 flex flex-col gap-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
            <span className="material-symbols-outlined text-[36px] text-[#94a3b8] mb-2 block">
              desktop_windows
            </span>
            <p className="font-headline font-bold text-[#0f172a]">
              Nenhum item encontrado nesta categoria
            </p>
            <p className="text-xs text-[#64748b] mt-1">
              Cadastre novos computadores montados, telas, mouses, teclados ou fones.
            </p>
            <button
              type="button"
              onClick={() => setCurrentView('new_item')}
              className="mt-4 px-4 py-2 rounded-xl bg-[#006194] text-white text-xs font-bold shadow-sm"
            >
              + Cadastrar Equipamento
            </button>
          </div>
        ) : (
          filteredItems.map(item => {
            const isOutOfStock = item.quantity === 0;
            const isSingleItem = item.quantity === 1;
            const catBadge = getCategoryBadge(item.category);
            const profit = item.salePrice - item.costPrice;
            const margin = item.costPrice > 0 ? ((profit / item.costPrice) * 100).toFixed(0) : '0';

            return (
              <div
                key={item.id}
                className={`product-item bg-white rounded-xl p-3.5 border border-[#e2e8f0] shadow-sm flex flex-col gap-2.5 transition-transform active:scale-[0.99] ${
                  isOutOfStock ? 'opacity-90' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-[#f1f5f9] shrink-0 overflow-hidden relative border border-[#e2e8f0]">
                      <img
                        alt={item.name}
                        className="w-full h-full object-cover"
                        src={item.photoUrl}
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=150&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="flex flex-col min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catBadge.color}`}>
                          {catBadge.label}
                        </span>
                        {item.condition === 'new' ? (
                          <span className="text-[10px] font-semibold text-[#006e2d] bg-[#dcfce7] px-1.5 py-0.2 rounded">
                            Novo Lacrado
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#b45309] bg-[#fef3c7] px-1.5 py-0.2 rounded">
                            Revisado
                          </span>
                        )}
                      </div>

                      <h3 className="font-headline text-[15px] sm:text-[16px] font-bold text-[#0f172a] leading-snug">
                        {item.name}
                      </h3>

                      {/* Specs for PC Montado */}
                      {item.specs && (
                        <div className="flex flex-wrap gap-1 text-[11px] text-[#475569] pt-0.5">
                          {item.specs.cpu && (
                            <span className="bg-[#f8fafc] px-1.5 py-0.5 rounded border border-[#e2e8f0]">
                              ⚙️ {item.specs.cpu}
                            </span>
                          )}
                          {item.specs.gpu && (
                            <span className="bg-[#f8fafc] px-1.5 py-0.5 rounded border border-[#e2e8f0]">
                              🎮 {item.specs.gpu}
                            </span>
                          )}
                          {item.specs.ram && (
                            <span className="bg-[#f8fafc] px-1.5 py-0.5 rounded border border-[#e2e8f0]">
                              ⚡ {item.specs.ram}
                            </span>
                          )}
                        </div>
                      )}

                      <span className="font-body text-[12px] text-[#64748b] truncate block">
                        {item.locationNote || `${item.warrantyMonths} meses de garantia`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveItemForSheet(item)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </div>

                {/* Pricing & Stock Strip */}
                <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fee2e2] text-[#ba1a1a] font-body text-[12px] font-bold border border-[#fecaca]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                        Esgotado
                      </span>
                    ) : isSingleItem ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] font-body text-[12px] font-bold border border-[#fde68a]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]"></span>
                        1 pronta entrega
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-body text-[12px] font-bold border border-[#bbf7d0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span>
                        {item.quantity} unidades prontas
                      </span>
                    )}
                    <span className="text-[11px] text-[#006e2d] font-medium hidden sm:inline-block">
                      +{margin}% margem
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-body text-[10px] text-[#64748b] block font-semibold uppercase tracking-wider">
                      Preço de Venda
                    </span>
                    <span
                      className={`font-headline text-[18px] sm:text-[19px] font-bold ${
                        isOutOfStock ? 'text-[#64748b]' : 'text-[#006194]'
                      }`}
                    >
                      {formatMoney(item.salePrice)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (+ Cadastrar PC ou Periférico) */}
      <div className="fixed right-4 bottom-20 z-30">
        <button
          type="button"
          onClick={() => setCurrentView('new_item')}
          className="flex items-center gap-2 h-12 px-5 rounded-full bg-[#006194] hover:bg-[#0284c7] text-white font-headline text-[14px] font-bold shadow-lg shadow-[#006194]/30 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">add</span>
          <span>+ Cadastrar PC / Periférico</span>
        </button>
      </div>

      {/* Context Action Bottom Sheet */}
      {activeItemForSheet && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setActiveItemForSheet(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl p-5 shadow-2xl flex flex-col gap-3 border-t border-[#e2e8f0] animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[#cbd5e1] mx-auto mb-1"></div>
            <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
              <div className="flex flex-col min-w-0">
                <span className="font-headline text-[16px] text-[#0f172a] font-bold truncate">
                  {activeItemForSheet.name}
                </span>
                <span className="font-body text-[12px] text-[#64748b]">
                  Estoque atual: {activeItemForSheet.quantity} un • Venda: {formatMoney(activeItemForSheet.salePrice)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveItemForSheet(null)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b] hover:text-[#0f172a]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {/* Stepper Quantity Adjustment */}
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline text-[14px] font-bold text-[#0f172a]">
                    Ajustar Unidades
                  </span>
                  <span className="text-xs text-[#64748b]">Adicionar ou dar baixa em pronta entrega</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-[#cbd5e1]">
                  <button
                    type="button"
                    onClick={() => adjustQuantity(activeItemForSheet.id, -1)}
                    className="w-8 h-8 flex items-center justify-center text-[#0f172a] hover:bg-[#f1f5f9] rounded font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="font-headline font-bold text-sm min-w-[20px] text-center">
                    {inventory.find(i => i.id === activeItemForSheet.id)?.quantity ?? activeItemForSheet.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustQuantity(activeItemForSheet.id, 1)}
                    className="w-8 h-8 flex items-center justify-center text-[#0f172a] hover:bg-[#f1f5f9] rounded font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Vender Este Item Agora */}
              <button
                type="button"
                onClick={() => {
                  setActiveItemForSheet(null);
                  setCurrentView('new_sale');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#eff6ff] hover:bg-[#dbeafe] text-[#006194] text-left transition-colors border border-[#bfdbfe]"
              >
                <div className="w-9 h-9 rounded-lg bg-[#006194] flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline text-[14px] font-bold text-[#006194]">
                    Registrar Venda Deste Item
                  </span>
                  <span className="text-xs text-[#006194]/80">Abrir tela de venda e parcelamento</span>
                </div>
              </button>

              {/* Alterar Preço */}
              <button
                type="button"
                onClick={() => {
                  setEditingPriceItem(activeItemForSheet);
                  setNewPriceValue(activeItemForSheet.salePrice.toString());
                  setActiveItemForSheet(null);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] text-left transition-colors border border-[#e2e8f0]"
              >
                <div className="w-9 h-9 rounded-lg bg-[#dcfce7] flex items-center justify-center text-[#006e2d] shrink-0">
                  <span className="material-symbols-outlined text-[20px]">sell</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline text-[14px] font-bold text-[#0f172a]">
                    Alterar Preço de Venda
                  </span>
                  <span className="text-xs text-[#64748b]">Atualizar valor anunciado no balcão</span>
                </div>
              </button>

              {/* Remover Item */}
              <button
                type="button"
                onClick={() => {
                  deleteInventoryItem(activeItemForSheet.id);
                  setActiveItemForSheet(null);
                  showToast('Item removido do catálogo.');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#fee2e2]/30 hover:bg-[#fee2e2]/50 text-[#ba1a1a] text-left transition-colors border border-[#fecaca]"
              >
                <div className="w-9 h-9 rounded-lg bg-[#fee2e2] flex items-center justify-center text-[#ba1a1a] shrink-0">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline text-[14px] font-bold text-[#ba1a1a]">
                    Remover do Catálogo
                  </span>
                  <span className="text-xs text-[#ba1a1a]/80">Excluir do catálogo da loja</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {editingPriceItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-[#cbd5e1] space-y-4">
            <h4 className="font-headline font-bold text-[16px] text-[#0f172a]">
              Alterar Preço de Venda
            </h4>
            <p className="text-xs text-[#64748b]">{editingPriceItem.name}</p>

            <div className="relative">
              <span className="absolute left-3 top-3 text-[#64748b] font-bold text-sm">R$</span>
              <input
                type="number"
                value={newPriceValue}
                onChange={e => setNewPriceValue(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#cbd5e1] font-headline text-lg font-bold text-[#006194] focus:outline-none focus:ring-2 focus:ring-[#006194]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingPriceItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#f1f5f9] text-[#475569] font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseFloat(newPriceValue);
                  if (!isNaN(val) && val > 0) {
                    updateInventoryItem({
                      ...editingPriceItem,
                      salePrice: val,
                    });
                    showToast('Preço atualizado com sucesso!');
                  }
                  setEditingPriceItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#006194] text-white font-bold text-xs shadow-sm"
              >
                Salvar Preço
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal Simulation */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-between p-6">
          <div className="w-full max-w-sm flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-[#93ccff]">
                barcode_scanner
              </span>
              <span className="font-headline text-[16px] font-bold">Ler Código do Produto</span>
            </div>
            <button
              type="button"
              onClick={() => setShowScannerModal(false)}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="w-64 h-64 bg-white/10 rounded-2xl border-2 border-dashed border-[#93ccff] flex flex-col items-center justify-center p-4 relative">
            <div className="w-full h-0.5 bg-[#00e5ff] absolute top-1/2 shadow-[0_0_12px_#00e5ff] animate-pulse"></div>
            <span className="text-xs text-white font-medium bg-black/60 px-3 py-1.5 rounded-full z-10">
              Aponte para a caixa ou etiqueta
            </span>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setShowScannerModal(false);
                setSearchQuery('Monitor Gamer');
                showToast('Produto localizado: Monitor Gamer');
              }}
              className="w-full py-3 bg-[#006194] hover:bg-[#0284c7] text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              Simular Leitura (Monitor Gamer)
            </button>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in duration-150">
          <span className="material-symbols-outlined text-[#7ffc97] text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
