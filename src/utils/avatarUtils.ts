// Preset avatars for profile selection
export interface AvatarPreset {
  id: string;
  name: string;
  url: string;
}

export const PRESET_AVATARS: AvatarPreset[] = [
  {
    id: 'tech-1',
    name: 'Técnico Hardware',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'tech-2',
    name: 'Gamer Pro',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'tech-3',
    name: 'Especialista Bancada',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'tech-4',
    name: 'Montadora PCs',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'tech-5',
    name: 'Cyberpunk Blue',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'tech-6',
    name: 'Mestre da Bancada',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&h=256&q=80',
  },
];

/**
 * Resizes an uploaded image file and returns a base64 DataURL
 * suitable for localStorage storage (< 30KB).
 */
export const resizeImageFile = (
  file: File,
  maxDimension = 180,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Erro ao carregar a imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
    reader.readAsDataURL(file);
  });
};

/**
 * Strips any unwanted suffix like (ADM) or ADM from a user's display name
 */
export const cleanUserName = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/\s*\((?:ADM|adm)\)/gi, '')
    .replace(/\s+(?:ADM|adm)$/gi, '')
    .trim();
};
