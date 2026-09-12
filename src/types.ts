export type ProductCategory =
  | 'pc_montado'
  | 'monitor'
  | 'mouse'
  | 'mousepad'
  | 'teclado'
  | 'headset'
  | 'kit_completo';

export type ProductCondition = 'new' | 'used';

export interface PCSpecs {
  cpu?: string;
  gpu?: string;
  ram?: string;
  storage?: string;
  psu?: string;
  caseModel?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: ProductCategory;
  condition: ProductCondition;
  costPrice: number;
  salePrice: number;
  quantity: number;
  warrantyMonths: number;
  locationNote?: string;
  photoUrl: string;
  specs?: PCSpecs;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  socialHandle?: string;
  origin?: string;
  address?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'promissoria' | 'pix_mensal' | 'boleto' | 'pix_vista' | 'cartao';

export type InstallmentStatus = 'pending' | 'paid' | 'overdue';

export interface Installment {
  id: string;
  saleId: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidAt?: string;
  paidPaymentMethod?: string;
  paidNotes?: string;
  status: InstallmentStatus;
}

export interface SaleItemSelection {
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  saleCode: string; // e.g. #PC-5021
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientSocial?: string;
  productDescription: string;
  items?: SaleItemSelection[];
  totalAmount: number;
  downPayment: number;
  remainingBalance: number;
  installmentCount: number;
  paymentMethod: PaymentMethod;
  firstDueDate: string;
  status: 'active' | 'completed' | 'overdue';
  warrantyNote: string;
  authenticationCode: string;
  installments: Installment[];
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  email?: string;
  role?: 'admin' | 'vendedor';
  storeName?: string;
  phone?: string;
  pixKey?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export type AppView =
  | 'dashboard'
  | 'inventory'
  | 'new_item'
  | 'clients'
  | 'new_sale'
  | 'receipt'
  | 'profile'
  | 'login';
