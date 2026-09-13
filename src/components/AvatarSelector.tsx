import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, UserCircle } from 'lucide-react';
import { PRESET_AVATARS, resizeImageFile } from '../utils/avatarUtils';

interface AvatarSelectorProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string) => void;
  userName?: string;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  userName = 'Usuário',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const resizedDataUrl = await resizeImageFile(file, 200, 0.82);
      onAvatarChange(resizedDataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-3 bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
      <div className="flex items-center justify-between">
        <label className="font-body text-[11px] text-[#475569] uppercase tracking-wider font-bold flex items-center gap-1.5">
          <UserCircle size={16} className="text-[#006194]" />
          <span>Foto de Perfil do Usuário</span>
        </label>
        {currentAvatarUrl && (
          <button
            type="button"
            onClick={() => onAvatarChange('')}
            className="text-[11px] text-[#ba1a1a] hover:underline font-semibold"
          >
            Remover foto
          </button>
        )}
      </div>

      {errorMessage && (
        <p className="text-xs text-[#ba1a1a] bg-[#fee2e2] p-2 rounded-lg font-medium">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Current Avatar Preview */}
        <div className="relative group shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#006194] text-white flex items-center justify-center font-headline font-bold text-lg shadow-sm border-2 border-white ring-2 ring-[#006194]/20">
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{getInitials(userName)}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#006194] text-white flex items-center justify-center shadow-md hover:bg-[#0284c7] transition-all"
            title="Carregar foto do aparelho"
          >
            <Camera size={14} />
          </button>
        </div>

        {/* Upload Button */}
        <div className="flex-1 w-full space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-3 py-2 bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#0f172a] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <ImagePlus size={18} className="text-[#006194]" />
            <span>
              {isProcessing ? 'Carregando foto...' : 'Escolher foto da galeria ou PC'}
            </span>
          </button>

          {/* Quick Preset Avatars */}
          <div>
            <span className="text-[10px] text-[#64748b] font-medium block mb-1.5">
              Ou selecione um avatar rápido:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {PRESET_AVATARS.map(preset => {
                const isSelected = currentAvatarUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onAvatarChange(preset.url)}
                    className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#006194] scale-105 shadow-sm'
                        : 'opacity-70 hover:opacity-100 hover:scale-100'
                    }`}
                    title={preset.name}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
