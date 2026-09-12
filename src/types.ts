export type ProductCategory = 'todos' | 'pc_montado' | 'monitor' | 'mousepad' | 'teclado' | 'mouse' | 'fone';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  specs: string[];
  priceCash: number;
  priceInstallments: number;
  maxInstallments: number;
  stockQuantity: number;
  readyForDelivery: boolean;
  imageUrl: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  handle?: string;
  city?: string;
  source?: string;
  // Informações da Venda / Parcelamento
  soldItemsSummary?: string;     // Ex: "PC Gamer i5 + RTX 4060 + Monitor 27\""
  totalAmount?: number;          // Valor total da compra
  downPayment?: number;          // Quanto de entrada foi pago
  installmentsCount?: number;    // Quantas vezes foi parcelado
  installmentValue?: number;     // Valor de cada parcela
  totalPending: number;          // Quanto ainda falta pagar
  totalPaid: number;             // Total já pago
  installmentsPending: number;   // Parcelas restantes
  status: 'quitado' | 'pendente' | 'atrasado';
  notes?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientCpf?: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  downPayment?: number;
  paymentMethod: 'pix' | 'cartao' | 'parcelado_loja';
  installmentsCount: number;
  installmentValue: number;
  paidInstallments: number;
  date: string;
  status: 'concluido' | 'pendente_pagamento';
  notes?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // senha salva localmente
  fullName: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface TerminalActivation {
  hwid: string;
  status: 'bloqueado' | 'ativo' | 'aguardando_codigo';
  licenseKey: string;
  ownerEmail: string;
  authorizedAt?: string;
  lastCodeGenerated?: string;
  activeUser?: UserAccount | null;
}

export interface AccessRequest {
  id: string;
  hwid: string;
  fullName: string;
  email: string;
  whatsapp: string;
  storeName: string;
  role: string;
  requestedAt: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  accessCode?: string;
}

export interface StoreProfile {
  fullName: string;
  role: string;
  storeBranch: string;
  corporateEmail: string;
  whatsappContact: string;
  pixKey?: string;
  technicianId: string;
  avatarUrl: string;
  licenseId: string;
  licensePlan: string;
  licenseExpiry: string;
  deviceLimit: number;
  connectedDevices: number;
}

