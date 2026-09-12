import React, { useState } from 'react';
import { Product } from '../types';

interface ProductsViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onSelectForSale: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onAddProduct,
  onSelectForSale,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<Product['category']>('pc_montado');
  const [specs, setSpecs] = useState<string>('');
  const [priceCash, setPriceCash] = useState<number>(3490);
  const [priceInstallments, setPriceInstallments] = useState<number>(3990);
  const [maxInstallments, setMaxInstallments] = useState<number>(12);
  const [stockQuantity, setStockQuantity] = useState<number>(2);
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80'
  );

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'pc_montado', label: 'PCs Montados' },
    { id: 'monitor', label: 'Monitores' },
    { id: 'mousepad', label: 'Mousepads' },
    { id: 'teclado', label: 'Teclados' },
    { id: 'mouse', label: 'Mouses' },
    { id: 'fone', label: 'Headsets' },
  ];

  const filteredProducts =
    selectedCategory === 'todos'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const specsArray = specs
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onAddProduct({
      name,
      category,
      specs: specsArray.length > 0 ? specsArray : ['Configuração padrão pronta entrega'],
      priceCash: Number(priceCash),
      priceInstallments: Number(priceInstallments),
      maxInstallments: Number(maxInstallments),
      stockQuantity: Number(stockQuantity),
      readyForDelivery: true,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
    });

    setName('');
    setSpecs('');
    setIsModalOpen(false);
  };

  const presetImages = [
    { label: 'PC Gamer RGB', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80' },
    { label: 'Gabinete Aquário', url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&auto=format&fit=crop&q=80' },
    { label: 'Monitor Gamer', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80' },
    { label: 'Teclado Mecânico', url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80' },
    { label: 'Mouse Gamer', url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80' },
    { label: 'Mousepad Speed 90x40', url: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&auto=format&fit=crop&q=80' },
    { label: 'Headset Pro', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="space-y-4 pb-28 pt-16 px-4 max-w-lg mx-auto w-full">
      {/* Category Tabs Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar">
        {categories.map((cat) => {
          const count =
            cat.id === 'todos'
              ? products.length
              : products.filter((p) => p.category === cat.id).length;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-[#00658c] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.id === 'todos' && <span className="material-symbols-outlined text-[16px]">grid_view</span>}
              {cat.id === 'pc_montado' && <span className="material-symbols-outlined text-[16px]">desktop_windows</span>}
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-semibold text-slate-800">
            {filteredProducts.length} PCs &amp; periféricos prontos para entrega
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">verified</span> Pronta Entrega
        </span>
      </div>

      {/* Empty State Card (Exatamente como Screenshot 1) */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-4 my-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-[#00658c] flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">desktop_windows</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Nenhum item encontrado nesta categoria
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Cadastre novos computadores montados, telas, mouses, teclados ou fones.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-[#00658c] hover:bg-[#00344f] text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Cadastrar Equipamento</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 hover:border-slate-300 transition-all flex gap-3"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{p.name}</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">
                      {p.stockQuantity} em estoque
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {p.specs.join(' • ')}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">À vista (Pix):</p>
                    <p className="text-sm font-extrabold text-[#00344f]">
                      R$ {p.priceCash.toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectForSale(p)}
                    className="px-3 py-1.5 bg-[#034c70] hover:bg-[#00344f] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[15px]">shopping_cart</span>
                    <span>Vender</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botão Flutuante + Cadastrar PC / Periférico (Screenshot 1) */}
      <div className="fixed bottom-20 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
        <button
          onClick={() => setIsModalOpen(true)}
          className="pointer-events-auto bg-[#00658c] hover:bg-[#00344f] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all duration-150 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>+ Cadastrar PC / Periférico</span>
        </button>
      </div>

      {/* Modal de Cadastro de Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-[#00344f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#5dc6ff]">add_circle</span>
                <h3 className="text-sm font-bold">Cadastrar Novo Equipamento / PC</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Nome do Equipamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PC Gamer Ryzen 5 5600 + RTX 4060"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Categoria *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Product['category'])}
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c] bg-white"
                >
                  <option value="pc_montado">PC Montado</option>
                  <option value="monitor">Monitor</option>
                  <option value="mousepad">Mousepad</option>
                  <option value="teclado">Teclado</option>
                  <option value="mouse">Mouse</option>
                  <option value="fone">Fone / Headset</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Preço à Vista (R$) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={priceCash}
                    onChange={(e) => setPriceCash(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Preço Parcelado (R$)</label>
                  <input
                    type="number"
                    min={0}
                    value={priceInstallments}
                    onChange={(e) => setPriceInstallments(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Estoque (Unidades)</label>
                  <input
                    type="number"
                    min={1}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Máx Parcelas</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={maxInstallments}
                    onChange={(e) => setMaxInstallments(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#00658c]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Especificações Técnicas</label>
                <textarea
                  rows={2}
                  placeholder="Linha por linha: Processador, Placa de vídeo, Memória RAM..."
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#00658c]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">URL Direta da Imagem</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#00658c]"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 self-center">Presets rápidos:</span>
                  {presetImages.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00658c] hover:bg-[#00344f] text-white rounded-xl font-bold shadow-xs"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
