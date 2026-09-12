import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory, ProductCondition } from '../types';
import { formatMoney } from '../utils/formatters';

export const NewItemView: React.FC = () => {
  const { addInventoryItem, setCurrentView } = useApp();

  const [itemType, setItemType] = useState<'pc_montado' | 'peripheric'>('pc_montado');
  const [category, setCategory] = useState<ProductCategory>('pc_montado');
  const [name, setName] = useState('PC Gamer Ryzen 5 5600 + RTX 4060 8GB + 16GB RAM + SSD 1TB');
  const [condition, setCondition] = useState<ProductCondition>('new');
  const [quantity, setQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState(3200);
  const [salePrice, setSalePrice] = useState(4390);
  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [locationNote, setLocationNote] = useState('Montado na bancada • Testado com FurMark & Cinebench');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80'
  );

  // Detailed PC specs
  const [cpuSpec, setCpuSpec] = useState('AMD Ryzen 5 5600 6C/12T');
  const [gpuSpec, setGpuSpec] = useState('GeForce RTX 4060 8GB GDDR6');
  const [ramSpec, setRamSpec] = useState('16GB DDR4 3200MHz');
  const [storageSpec, setStorageSpec] = useState('SSD M.2 NVMe 1TB Gen4');
  const [psuSpec, setPsuSpec] = useState('Fonte 650W 80 Plus');
  const [caseSpec, setCaseSpec] = useState('Gabinete Aquário com 4 Fans ARGB');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Real-time calculations
  const profitPerUnit = salePrice - costPrice;
  const marginPercent = costPrice > 0 ? ((profitPerUnit / costPrice) * 100).toFixed(1) : '0';
  const isPositiveMargin = profitPerUnit >= 0;

  const periphericCategories: { id: ProductCategory; label: string; icon: string }[] = [
    { id: 'monitor', label: 'Monitor / Tela', icon: 'tv' },
    { id: 'mouse', label: 'Mouse', icon: 'mouse' },
    { id: 'mousepad', label: 'Mousepad', icon: 'layers' },
    { id: 'teclado', label: 'Teclado', icon: 'keyboard' },
    { id: 'headset', label: 'Headset / Fone', icon: 'headphones' },
    { id: 'kit_completo', label: 'Kit Setup Completo', icon: 'devices' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = evt => {
        if (evt.target?.result) {
          setPhotoUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectType = (type: 'pc_montado' | 'peripheric') => {
    setItemType(type);
    if (type === 'pc_montado') {
      setCategory('pc_montado');
      setName('PC Gamer Ryzen 5 5600 + RTX 4060 8GB');
      setCostPrice(3200);
      setSalePrice(4390);
      setWarrantyMonths(12);
      setPhotoUrl('https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80');
    } else {
      setCategory('monitor');
      setName('Monitor Gamer 24" 165Hz IPS UltraGear');
      setCostPrice(790);
      setSalePrice(1099);
      setWarrantyMonths(12);
      setPhotoUrl('https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80');
    }
  };

  const handleSelectPeriphericCategory = (cat: ProductCategory) => {
    setCategory(cat);
    switch (cat) {
      case 'monitor':
        setName('Monitor Gamer 24" 165Hz IPS UltraGear');
        setCostPrice(790);
        setSalePrice(1099);
        setPhotoUrl('https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80');
        break;
      case 'mouse':
        setName('Mouse Gamer RGB 12.800 DPI Ultraleve');
        setCostPrice(85);
        setSalePrice(159);
        setPhotoUrl('https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80');
        break;
      case 'mousepad':
        setName('Mousepad Gamer Speed Extra Grande 90x40cm');
        setCostPrice(42);
        setSalePrice(89);
        setPhotoUrl('https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80');
        break;
      case 'teclado':
        setName('Teclado Mecânico RGB Switch Red ABNT2');
        setCostPrice(160);
        setSalePrice(289);
        setPhotoUrl('https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80');
        break;
      case 'headset':
        setName('Headset Gamer 7.1 Surround Espacial com Microfone');
        setCostPrice(170);
        setSalePrice(299);
        setPhotoUrl('https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80');
        break;
      case 'kit_completo':
        setName('Kit Setup Completo: PC Gamer + Monitor 165Hz + Teclado + Mouse + Pad + Fone');
        setCostPrice(4200);
        setSalePrice(5890);
        setPhotoUrl('https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500&auto=format&fit=crop&q=80');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addInventoryItem({
        name,
        category: itemType === 'pc_montado' ? 'pc_montado' : category,
        condition,
        costPrice,
        salePrice,
        quantity,
        warrantyMonths,
        locationNote,
        photoUrl:
          photoUrl ||
          'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80',
        specs:
          itemType === 'pc_montado'
            ? {
                cpu: cpuSpec,
                gpu: gpuSpec,
                ram: ramSpec,
                storage: storageSpec,
                psu: psuSpec,
                caseModel: caseSpec,
              }
            : undefined,
      });
      setIsSubmitting(false);
      setSavedSuccess(true);

      setTimeout(() => {
        setCurrentView('inventory');
      }, 1000);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 pt-4 pb-28 space-y-4">
      {/* Fluxo de Retorno & Título */}
      <div className="flex flex-col space-y-1">
        <button
          type="button"
          onClick={() => setCurrentView('inventory')}
          className="inline-flex items-center gap-1 text-[#006194] font-body text-[14px] font-bold w-fit transition-colors hover:text-[#007bb9]"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Voltar ao Catálogo</span>
        </button>

        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="font-headline text-[24px] sm:text-[28px] text-[#0f172a] font-bold tracking-tight">
              Cadastrar Produto
            </h1>
            <p className="font-body text-[13px] text-[#64748b]">
              Cadastre PCs montados completos ou periféricos avulsos (telas, mouses, teclados, fones).
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#006194] shadow-xs">
            <span className="material-symbols-outlined text-[22px]">desktop_windows</span>
          </div>
        </div>
      </div>

      {/* Switcher Principal: PC Montado vs Periférico / Monitor */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#f1f5f9] rounded-xl border border-[#cbd5e1]">
        <button
          type="button"
          onClick={() => handleSelectType('pc_montado')}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg font-headline text-[14px] font-bold transition-all ${
            itemType === 'pc_montado'
              ? 'bg-[#006194] text-white shadow-sm'
              : 'text-[#475569] hover:text-[#0f172a]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">desktop_windows</span>
          <span>PC Montado Completo</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectType('peripheric')}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg font-headline text-[14px] font-bold transition-all ${
            itemType === 'peripheric'
              ? 'bg-[#006194] text-white shadow-sm'
              : 'text-[#475569] hover:text-[#0f172a]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">headphones</span>
          <span>Periférico / Tela</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Escolha de Subcategoria se for Periférico */}
        {itemType === 'peripheric' && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] space-y-3 animate-in fade-in duration-200">
            <label className="font-body text-[11px] text-[#64748b] uppercase tracking-wider font-bold block">
              Qual periférico você está cadastrando?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {periphericCategories.map(cat => {
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectPeriphericCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg font-body text-[13px] border transition-all text-left ${
                      isActive
                        ? 'bg-[#eff6ff] border-[#006194] text-[#006194] font-bold shadow-xs'
                        : 'bg-[#f8fafc] border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Nome do Produto / PC */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] space-y-3">
          <div className="space-y-1">
            <label
              htmlFor="product-name"
              className="font-body text-[11px] text-[#64748b] uppercase tracking-wider font-bold block"
            >
              {itemType === 'pc_montado' ? 'Nome do PC Montado *' : 'Nome do Periférico / Modelo *'}
            </label>
            <input
              id="product-name"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={
                itemType === 'pc_montado'
                  ? 'Ex: PC Gamer Ryzen 5 5600 + RTX 4060 8GB'
                  : 'Ex: Monitor Gamer 24" 165Hz IPS'
              }
              className="w-full h-12 px-3.5 bg-[#f8fafc] text-[#0f172a] rounded-lg font-body text-[15px] border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
            />
          </div>

          {/* Se for PC Montado: Campos com as especificações da montagem */}
          {itemType === 'pc_montado' && (
            <div className="space-y-3 pt-2 border-t border-[#f1f5f9]">
              <span className="font-body text-[12px] text-[#006194] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Especificações do Setup (Para o Recibo e WhatsApp):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-[#64748b] font-semibold block">Processador (CPU)</label>
                  <input
                    type="text"
                    value={cpuSpec}
                    onChange={e => setCpuSpec(e.target.value)}
                    placeholder="Ex: Ryzen 5 5600 / Core i5 12400F"
                    className="w-full p-2 bg-[#f8fafc] rounded border border-[#cbd5e1] text-xs font-medium text-[#0f172a]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#64748b] font-semibold block">Placa de Vídeo (GPU)</label>
                  <input
                    type="text"
                    value={gpuSpec}
                    onChange={e => setGpuSpec(e.target.value)}
                    placeholder="Ex: RTX 4060 8GB / RX 6600"
                    className="w-full p-2 bg-[#f8fafc] rounded border border-[#cbd5e1] text-xs font-medium text-[#0f172a]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#64748b] font-semibold block">Memória RAM</label>
                  <input
                    type="text"
                    value={ramSpec}
                    onChange={e => setRamSpec(e.target.value)}
                    placeholder="Ex: 16GB (2x8GB) DDR4 3200MHz"
                    className="w-full p-2 bg-[#f8fafc] rounded border border-[#cbd5e1] text-xs font-medium text-[#0f172a]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#64748b] font-semibold block">Armazenamento (SSD)</label>
                  <input
                    type="text"
                    value={storageSpec}
                    onChange={e => setStorageSpec(e.target.value)}
                    placeholder="Ex: SSD NVMe 1TB M.2"
                    className="w-full p-2 bg-[#f8fafc] rounded border border-[#cbd5e1] text-xs font-medium text-[#0f172a]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#64748b] font-semibold block">Fonte de Alimentação</label>
                  <input
                    type="text"
                    value={psuSpec}
                    onChange={e => setPsuSpec(e.target.value)}
                    placeholder="Ex: Fonte 650W 80 Plus Bronze"
                    className="w-full p-2 bg-[#f8fafc] rounded border border-[#cbd5e1] text-xs font-medium text-[#0f172a]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#64748b] font-semibold block">Gabinete / Refrigeração</label>
                  <input
                    type="text"
                    value={caseSpec}
                    onChange={e => setCaseSpec(e.target.value)}
                    placeholder="Ex: Gabinete Aquário RGB + 4 Fans"
                    className="w-full p-2 bg-[#f8fafc] rounded border border-[#cbd5e1] text-xs font-medium text-[#0f172a]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Condição */}
          <div className="pt-2">
            <label className="font-body text-[11px] text-[#64748b] uppercase tracking-wider font-bold block mb-1.5">
              Condição
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('new')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  condition === 'new'
                    ? 'bg-[#eff6ff] text-[#006194] border-[#006194] shadow-xs'
                    : 'bg-[#f8fafc] text-[#64748b] border-[#cbd5e1]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Novo / Lacrado</span>
              </button>

              <button
                type="button"
                onClick={() => setCondition('used')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  condition === 'used'
                    ? 'bg-[#eff6ff] text-[#006194] border-[#006194] shadow-xs'
                    : 'bg-[#f8fafc] text-[#64748b] border-[#cbd5e1]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">published_with_changes</span>
                <span>Seminovo Revisado na Bancada</span>
              </button>
            </div>
          </div>
        </div>

        {/* Foto do Equipamento */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-headline font-bold text-[14px] text-[#0f172a] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#006194] text-[20px]">
                photo_camera
              </span>
              Foto do Setup ou Embalagem
            </span>
            <span className="font-body text-[11px] text-[#006e2d] bg-[#dcfce7] px-2 py-0.5 rounded-full font-bold">
              Foto para WhatsApp
            </span>
          </div>

          <div className="relative rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] p-4 flex flex-col items-center justify-center text-center">
            {photoUrl ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-[#cbd5e1] mb-3">
                <img
                  src={photoUrl}
                  alt="Prévia do produto"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#006194] shadow-xs mb-2">
                <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2 w-full max-w-xs">
              <label className="flex-1 min-h-[40px] bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg py-2 px-3 text-[#006194] font-body text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <span>Tirar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              <label className="flex-1 min-h-[40px] bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg py-2 px-3 text-[#475569] font-body text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">image</span>
                <span>Galeria</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Quantidade e Precificação */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#006194] text-[20px]">
                payments
              </span>
              <h2 className="font-headline font-bold text-[15px] text-[#0f172a]">
                Custos, Venda e Margem
              </h2>
            </div>
            <span className="font-body text-[11px] text-[#64748b]">Cálculo instantâneo</span>
          </div>

          {/* Stepper de Unidades */}
          <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
            <div className="flex flex-col">
              <span className="font-headline font-bold text-[14px] text-[#0f172a]">
                Unidades em Pronta Entrega
              </span>
              <span className="font-body text-[12px] text-[#64748b]">
                Disponíveis no balcão
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-lg border border-[#cbd5e1] shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded flex items-center justify-center text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#006194]"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <span className="font-headline text-[18px] font-bold text-[#0f172a] min-w-[28px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded flex items-center justify-center text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#006194]"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          </div>

          {/* Preços */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label
                htmlFor="cost-price"
                className="font-body text-[11px] text-[#64748b] uppercase tracking-wider font-bold block"
              >
                Preço de Custo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-[#64748b] font-body text-[13px] font-semibold">
                  R$
                </span>
                <input
                  id="cost-price"
                  type="number"
                  step="10"
                  value={costPrice}
                  onChange={e => setCostPrice(parseFloat(e.target.value) || 0)}
                  className="w-full h-12 pl-10 pr-3 bg-[#f8fafc] text-[#0f172a] rounded-lg font-headline text-[18px] font-bold border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
                />
              </div>
              <p className="font-body text-[11px] text-[#64748b]">Custo total de montagem/peças</p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="sell-price"
                className="font-body text-[11px] text-[#006194] uppercase tracking-wider font-bold block"
              >
                Preço de Venda
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-[#006194] font-body text-[13px] font-bold">
                  R$
                </span>
                <input
                  id="sell-price"
                  type="number"
                  step="10"
                  value={salePrice}
                  onChange={e => setSalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full h-12 pl-10 pr-3 bg-[#f8fafc] text-[#006194] rounded-lg font-headline text-[18px] font-bold border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
                />
              </div>
              <p className="font-body text-[11px] text-[#64748b]">Preço anunciado ao cliente</p>
            </div>
          </div>

          {/* Lucro Previsto */}
          <div
            className={`rounded-xl p-4 flex items-center justify-between border transition-all ${
              isPositiveMargin
                ? 'bg-[#dcfce7]/30 border-[#bbf7d0]'
                : 'bg-[#fee2e2]/40 border-[#fecaca]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isPositiveMargin ? 'bg-[#7cf994] text-[#007230]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {isPositiveMargin ? 'trending_up' : 'trending_down'}
                </span>
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-body text-[11px] uppercase tracking-wider font-bold ${
                    isPositiveMargin ? 'text-[#007230]' : 'text-[#ba1a1a]'
                  }`}
                >
                  Lucro Líquido por Unidade
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span
                    className={`font-headline text-[18px] font-bold ${
                      isPositiveMargin ? 'text-[#007230]' : 'text-[#ba1a1a]'
                    }`}
                  >
                    {formatMoney(profitPerUnit)}
                  </span>
                  <span
                    className={`font-body text-[12px] font-bold px-2 py-0.5 rounded-full ${
                      isPositiveMargin
                        ? 'bg-white text-[#006e2d] border border-[#bbf7d0]'
                        : 'bg-white text-[#ba1a1a] border border-[#fecaca]'
                    }`}
                  >
                    {isPositiveMargin ? `+${marginPercent}% margem` : `${marginPercent}% prejuízo`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Garantia & Local */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] space-y-4">
          <div className="space-y-2">
            <label className="font-body text-[11px] text-[#64748b] uppercase tracking-wider font-bold block">
              Garantia do Balcão
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { months: 3, label: '3 Meses' },
                { months: 6, label: '6 Meses' },
                { months: 12, label: '1 Ano (12m)' },
              ].map(opt => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setWarrantyMonths(opt.months)}
                  className={`py-2.5 rounded-lg font-body text-[13px] transition-all ${
                    warrantyMonths === opt.months
                      ? 'bg-[#006194] text-white font-bold shadow-xs'
                      : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="notes"
              className="font-body text-[11px] text-[#64748b] uppercase tracking-wider font-bold block"
            >
              Observações / Testes Realizados
            </label>
            <input
              id="notes"
              type="text"
              value={locationNote}
              onChange={e => setLocationNote(e.target.value)}
              placeholder="Ex: Testado em bancada, cabos organizados, pronto para entrega"
              className="w-full h-12 px-3.5 bg-[#f8fafc] text-[#0f172a] rounded-lg font-body text-[14px] border border-[#cbd5e1] focus:outline-none focus:bg-white focus:border-[#006194]"
            />
          </div>
        </div>

        {/* Ação Salvar */}
        <div className="flex flex-col space-y-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full h-14 rounded-xl font-headline text-[16px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
              savedSuccess ? 'bg-[#006e2d] text-white' : 'bg-[#006194] hover:bg-[#007bb9] text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[22px] animate-spin">sync</span>
                <span>Salvando no Catálogo...</span>
              </>
            ) : savedSuccess ? (
              <>
                <span className="material-symbols-outlined text-[22px]">check_circle</span>
                <span>Cadastrado com Sucesso!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[22px]">save</span>
                <span>Salvar {itemType === 'pc_montado' ? 'PC Montado' : 'Periférico'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('inventory')}
            className="w-full h-11 flex items-center justify-center font-body text-[13px] text-[#64748b] hover:text-[#ba1a1a]"
          >
            Cancelar e Descartar
          </button>
        </div>
      </form>
    </div>
  );
};
