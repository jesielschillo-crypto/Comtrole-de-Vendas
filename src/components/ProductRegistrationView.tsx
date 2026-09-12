import React, { useState } from 'react';
import { Product } from '../types';

interface ProductRegistrationViewProps {
  onSave: (product: Omit<Product, 'id'>) => void;
  onCancel: () => void;
}

const categoryOptions: { value: Exclude<Product['category'], 'todos'>; label: string; icon: string }[] = [
  { value: 'pc_montado', label: 'PC montado', icon: 'desktop_windows' },
  { value: 'monitor', label: 'Tela / monitor', icon: 'tv' },
  { value: 'mouse', label: 'Mouse', icon: 'mouse' },
  { value: 'teclado', label: 'Teclado', icon: 'keyboard' },
  { value: 'mousepad', label: 'Mousepad', icon: 'layers' },
  { value: 'fone', label: 'Fone / headset', icon: 'headphones' },
];

export const ProductRegistrationView: React.FC<ProductRegistrationViewProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exclude<Product['category'], 'todos'>>('pc_montado');
  const [specs, setSpecs] = useState('');
  const [priceCash, setPriceCash] = useState('');
  const [priceInstallments, setPriceInstallments] = useState('');
  const [maxInstallments, setMaxInstallments] = useState('1');
  const [stockQuantity, setStockQuantity] = useState('1');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const specsList = specs.split('\n').map(item => item.trim()).filter(Boolean);

    onSave({
      name: name.trim(),
      category,
      specs: specsList.length ? specsList : ['Produto pronto para entrega'],
      priceCash: Number(priceCash),
      priceInstallments: Number(priceInstallments || priceCash),
      maxInstallments: Number(maxInstallments),
      stockQuantity: Number(stockQuantity),
      readyForDelivery: true,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pt-16 pb-28 space-y-4 min-w-0">
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-1 text-sm font-bold text-[#006194]">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        <span>Voltar ao estoque</span>
      </button>

      <header className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold text-slate-900 break-words">Cadastrar peça ou equipamento</h2>
          <p className="mt-1 text-sm text-slate-500 break-words">Cadastre PCs, telas, mouses, teclados, mousepads e fones.</p>
        </div>
        <span className="material-symbols-outlined shrink-0 text-3xl text-[#006194]">add_box</span>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-5 min-w-0">
        <fieldset className="space-y-2">
          <legend className="text-xs font-bold uppercase tracking-wider text-slate-600">Tipo do produto</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categoryOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                className={`min-w-0 min-h-12 p-2 rounded-xl border text-xs font-bold flex items-center gap-2 text-left transition-colors ${category === option.value ? 'border-[#006194] bg-blue-50 text-[#006194]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="material-symbols-outlined shrink-0 text-[19px]">{option.icon}</span>
                <span className="break-words">{option.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="space-y-1">
          <label htmlFor="product-name" className="text-xs font-bold uppercase tracking-wider text-slate-600">Nome / modelo *</label>
          <input id="product-name" required value={name} onChange={event => setName(event.target.value)} placeholder="Ex.: Mouse Gamer 12.800 DPI" className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#006194]" />
        </div>

        <div className="space-y-1">
          <label htmlFor="product-specs" className="text-xs font-bold uppercase tracking-wider text-slate-600">Especificações</label>
          <textarea id="product-specs" value={specs} onChange={event => setSpecs(event.target.value)} placeholder="Uma especificação por linha" rows={4} className="w-full min-h-24 px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none resize-y focus:border-[#006194]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="cash-price" className="text-xs font-bold uppercase tracking-wider text-slate-600">Preço à vista (R$) *</label>
            <input id="cash-price" required min="0" step="0.01" type="number" value={priceCash} onChange={event => setPriceCash(event.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#006194]" />
          </div>
          <div className="space-y-1">
            <label htmlFor="installment-price" className="text-xs font-bold uppercase tracking-wider text-slate-600">Preço parcelado (R$)</label>
            <input id="installment-price" min="0" step="0.01" type="number" value={priceInstallments} onChange={event => setPriceInstallments(event.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#006194]" />
          </div>
          <div className="space-y-1">
            <label htmlFor="stock-quantity" className="text-xs font-bold uppercase tracking-wider text-slate-600">Quantidade *</label>
            <input id="stock-quantity" required min="0" type="number" value={stockQuantity} onChange={event => setStockQuantity(event.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#006194]" />
          </div>
          <div className="space-y-1">
            <label htmlFor="max-installments" className="text-xs font-bold uppercase tracking-wider text-slate-600">Parcelas máximas</label>
            <input id="max-installments" required min="1" type="number" value={maxInstallments} onChange={event => setMaxInstallments(event.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#006194]" />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="product-image" className="text-xs font-bold uppercase tracking-wider text-slate-600">Imagem (opcional)</label>
          <input id="product-image" type="url" value={imageUrl} onChange={event => setImageUrl(event.target.value)} placeholder="https://..." className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#006194]" />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
          <button type="button" onClick={onCancel} className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-600">Cancelar</button>
          <button type="submit" className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#006194] text-white text-sm font-bold shadow-sm">Salvar no estoque</button>
        </div>
      </form>
    </div>
  );
};