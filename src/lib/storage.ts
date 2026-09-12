import { Product, Client, Sale, TerminalActivation, AccessRequest, StoreProfile, UserAccount } from '../types';
import { getDynamicSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  TERMINAL: 'pc_craft_terminal_state',
  PRODUCTS: 'pc_craft_products',
  CLIENTS: 'pc_craft_clients',
  SALES: 'pc_craft_sales',
  REQUESTS: 'pc_craft_access_requests',
  PROFILE: 'pc_craft_store_profile',
  USERS: 'pc_craft_users',
  DEVICE_HWID: 'pc_craft_device_hwid',
};

export const DEFAULT_HWID = 'HWID-9842-XF-BR88';
export const MASTER_UNLOCK_CODE = '849210';
export const SECONDARY_UNLOCK_CODE = '123456';
export const ADMIN_WHATSAPP = '47988611619';
export const ADMIN_WHATSAPP_DISPLAY = '(47) 98861-1619';
export const ADMIN_EMAIL = 'jesielschillo@gmail.com';

// Gerador e Validador de Chave Anti-Repasse por Hardware ID
export function getOrGenerateDeviceHwid(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.DEVICE_HWID);
    if (existing && existing.trim()) return existing.trim();
  } catch {
    // ignore
  }

  // Gera um ID autêntico para este computador/navegador
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const newHwid = `PCC-8492-${randomChars}`;
  try {
    localStorage.setItem(STORAGE_KEYS.DEVICE_HWID, newHwid);
  } catch {
    // ignore
  }
  return newHwid;
}

// Calcula o código de 6 dígitos exclusivo e determinístico para um HWID específico
export function getHwidUnlockCode(hwid: string): string {
  const clean = (hwid || '').toUpperCase().trim();
  if (!clean || clean === DEFAULT_HWID) return MASTER_UNLOCK_CODE;
  let hash = 0;
  const salt = 'PCCRAFT_HARDWARE_PROTECT_2025_KEY';
  const str = clean + salt;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const codeNum = 100000 + (positive % 900000);
  return codeNum.toString();
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'PC Gamer Craft Ultra i5 12400F + RTX 4060',
    category: 'pc_montado',
    specs: ['Intel Core i5 12400F', 'RTX 4060 8GB GDDR6', '16GB RAM DDR4 3200MHz', 'SSD NVMe 1TB M.2', 'Fonte 600W 80 Plus'],
    priceCash: 4890,
    priceInstallments: 5490,
    maxInstallments: 12,
    stockQuantity: 3,
    readyForDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-2',
    name: 'PC Workstation & Streamer Ryzen 7 5700X',
    category: 'pc_montado',
    specs: ['Ryzen 7 5700X 8-Core', 'RTX 3060 12GB', '32GB RAM DDR4 3200MHz', 'SSD 1TB Gen4', 'Gabinete Aquário Vidro'],
    priceCash: 5350,
    priceInstallments: 5990,
    maxInstallments: 12,
    stockQuantity: 2,
    readyForDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-3',
    name: 'Monitor Gamer Curvo 27" 165Hz IPS 1ms',
    category: 'monitor',
    specs: ['27 Polegadas Full HD', 'Painel IPS 165Hz', '1ms MPRT FreeSync / G-Sync', 'Ajuste de Altura'],
    priceCash: 1190,
    priceInstallments: 1350,
    maxInstallments: 10,
    stockQuantity: 5,
    readyForDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-4',
    name: 'Monitor Gamer 24" 144Hz IPS Ultrafast',
    category: 'monitor',
    specs: ['24 Polegadas Full HD', 'Painel IPS 144Hz', 'Tempo de Resposta 1ms', 'Bordas Ultrafinas'],
    priceCash: 899,
    priceInstallments: 990,
    maxInstallments: 8,
    stockQuantity: 4,
    readyForDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-5',
    name: 'Mousepad Gamer Speed Extra Grande 90x40cm',
    category: 'mousepad',
    specs: ['Dimensão 900x400x3mm', 'Superfície Tecido Speed Pro', 'Bordas Costuradas Reforçadas', 'Base de Borracha Antiderrapante'],
    priceCash: 79,
    priceInstallments: 89,
    maxInstallments: 3,
    stockQuantity: 25,
    readyForDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-6',
    name: 'Mousepad Gamer RGB Chroma Control 80x30cm',
    category: 'mousepad',
    specs: ['Iluminação LED RGB 14 Modos', 'Superfície Micro-texturizada Control', 'Conexão USB Plug & Play', 'Resistente a respingos'],
    priceCash: 119,
    priceInstallments: 135,
    maxInstallments: 4,
    stockQuantity: 15,
    readyForDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-7',
    name: 'Teclado Mecânico RGB Switch Blue Gamer Pro',
    category: 'teclado',
    specs: ['Layout ABNT2', 'Switches Mecânicos Hot-Swap', 'RGB Chroma 16.8M Cores', 'Cabo Trançado Removível'],
    priceCash: 249,
    priceInstallments: 289,
    maxInstallments: 6,
    stockQuantity: 8,
    readyForDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-8',
    name: 'Teclado Mecânico Compacto 60% Switch Red Silencioso',
    category: 'teclado',
    specs: ['Formato 60% Ultracompacto', 'Switch Red Linear Suave', 'Keycaps PBT Double-Shot', 'Ideal para FPS e eSports'],
    priceCash: 289,
    priceInstallments: 320,
    maxInstallments: 6,
    stockQuantity: 6,
    readyForDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-9',
    name: 'Mouse Sem Fio Ultraleve 26.000 DPI 59g',
    category: 'mouse',
    specs: ['Sensor Pixart 3395', 'Conexão 2.4GHz + Bluetooth', 'Bateria 80h contínuas', 'Skates 100% PTFE'],
    priceCash: 199,
    priceInstallments: 229,
    maxInstallments: 5,
    stockQuantity: 12,
    readyForDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-10',
    name: 'Headset Gamer 7.1 Surround com Microfone Cancelador',
    category: 'fone',
    specs: ['Áudio Espacial 7.1', 'Drivers Neodímio 53mm', 'Almofadas Memory Foam', 'Compatível PC, PS5 e Celular'],
    priceCash: 299,
    priceInstallments: 340,
    maxInstallments: 6,
    stockQuantity: 6,
    readyForDelivery: true,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Jesiel schillo',
    phone: '47988611619',
    email: 'jesielschillo@gmail.com',
    cpf: '089.442.119-02',
    handle: '@jesielschillo',
    city: 'Blumenau',
    source: 'WhatsApp',
    soldItemsSummary: 'PC Gamer Craft Ultra i5 12400F + RTX 4060 + Mousepad 90x40',
    totalAmount: 4969,
    downPayment: 1500,
    installmentsCount: 4,
    installmentValue: 867.25,
    totalPending: 2601.75,
    totalPaid: 2367.25,
    installmentsPending: 3,
    status: 'pendente',
    notes: 'Entrada de R$ 1.500 paga no Pix. Restante parcelado em 4x pela loja.',
    createdAt: '2025-02-10',
  },
  {
    id: 'cli-2',
    name: 'Rodrigo Medeiros',
    phone: '47991223344',
    email: 'rodrigo.hardware@gmail.com',
    cpf: '054.118.992-31',
    handle: '@rodrigo_hardware',
    city: 'Joinville',
    source: 'Indicação',
    soldItemsSummary: 'Monitor Gamer Curvo 27" 165Hz + Teclado Mecânico RGB',
    totalAmount: 1439,
    downPayment: 1439,
    installmentsCount: 1,
    installmentValue: 0,
    totalPending: 0,
    totalPaid: 1439,
    installmentsPending: 0,
    status: 'quitado',
    notes: 'Compra quitada à vista via Pix com entrega imediata.',
    createdAt: '2025-02-05',
  },
  {
    id: 'cli-3',
    name: 'Mariana Silveira',
    phone: '47988334455',
    email: 'mariana.silveira@outlook.com',
    cpf: '071.932.441-80',
    handle: '@mariana.tech',
    city: 'Florianópolis',
    source: 'Instagram',
    soldItemsSummary: 'Mousepad Gamer Speed Extra Grande 90x40cm + Mouse Sem Fio 59g',
    totalAmount: 278,
    downPayment: 100,
    installmentsCount: 2,
    installmentValue: 89,
    totalPending: 89,
    totalPaid: 189,
    installmentsPending: 1,
    status: 'pendente',
    notes: 'Entrada de R$ 100,00 paga. 1 parcela de R$ 89,00 pendente.',
    createdAt: '2025-02-12',
  },
  {
    id: 'cli-4',
    name: 'Carlos Eduardo Ramos',
    phone: '47997788112',
    email: 'carlos.ramos@gmail.com',
    cpf: '042.883.190-67',
    handle: '@carlos.gamer',
    city: 'Itajaí',
    source: 'Balcão',
    soldItemsSummary: 'PC Workstation Ryzen 7 5700X + RTX 3060 12GB',
    totalAmount: 5350,
    downPayment: 2000,
    installmentsCount: 5,
    installmentValue: 670,
    totalPending: 2010,
    totalPaid: 3340,
    installmentsPending: 3,
    status: 'pendente',
    notes: 'Entrada de R$ 2.000,00 no ato. Restante em 5x.',
    createdAt: '2025-02-14',
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    clientName: 'Jesiel schillo',
    clientPhone: '47988611619',
    clientEmail: 'jesielschillo@gmail.com',
    clientCpf: '089.442.119-02',
    items: [
      { id: 'prod-1', name: 'PC Gamer Craft Ultra i5 12400F + RTX 4060', quantity: 1, price: 4890 },
      { id: 'prod-5', name: 'Mousepad Gamer Speed Extra Grande 90x40cm', quantity: 1, price: 79 }
    ],
    totalAmount: 4969,
    downPayment: 1500,
    paymentMethod: 'parcelado_loja',
    installmentsCount: 4,
    installmentValue: 867.25,
    paidInstallments: 1,
    date: '2025-02-10',
    status: 'pendente_pagamento',
    notes: 'Entrada de R$ 1.500 paga. Falta R$ 2.601,75 em 3 parcelas.'
  },
  {
    id: 'sale-2',
    clientName: 'Rodrigo Medeiros',
    clientPhone: '47991223344',
    clientEmail: 'rodrigo.hardware@gmail.com',
    clientCpf: '054.118.992-31',
    items: [
      { id: 'prod-3', name: 'Monitor Gamer Curvo 27" 165Hz IPS 1ms', quantity: 1, price: 1190 },
      { id: 'prod-7', name: 'Teclado Mecânico RGB Switch Blue', quantity: 1, price: 249 }
    ],
    totalAmount: 1439,
    downPayment: 1439,
    paymentMethod: 'pix',
    installmentsCount: 1,
    installmentValue: 0,
    paidInstallments: 1,
    date: '2025-02-05',
    status: 'concluido',
    notes: 'Pagamento integral à vista no Pix com desconto.'
  }
];

export const INITIAL_PROFILE: StoreProfile = {
  fullName: 'Jesiel Schillo',
  role: 'Administrador Geral & Técnico Master',
  storeBranch: 'PC Craft Hardware - Matriz',
  corporateEmail: 'jesielschillo@gmail.com',
  whatsappContact: '(47) 98861-1619',
  pixKey: '47988611619',
  technicianId: '#PC-8842',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  licenseId: 'PC-CRAFT-X9192-BR',
  licensePlan: 'Plano Pro / Lojista Hardware',
  licenseExpiry: '18/02/2026',
  deviceLimit: 3,
  connectedDevices: 1
};

export const INITIAL_REQUESTS: AccessRequest[] = [
  {
    id: 'req-demo-1',
    hwid: DEFAULT_HWID,
    fullName: 'Jesiel Schillo (Terminal Balcão)',
    email: 'jesielschillo@gmail.com',
    whatsapp: '47988611619',
    storeName: 'PC Craft Hardware - Matriz',
    role: 'Administrador / Gestor',
    requestedAt: new Date().toISOString(),
    status: 'aprovado',
    accessCode: MASTER_UNLOCK_CODE
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-admin-1',
    username: 'jesiel',
    email: 'jesielschillo@gmail.com',
    passwordHash: '123456',
    fullName: 'Jesiel Schillo',
    phone: '47988611619',
    role: 'Administrador',
    createdAt: '2025-01-15'
  }
];

// Helpers de Leitura e Escrita
export const StorageManager = {
  getDeviceHwid(): string {
    return getOrGenerateDeviceHwid();
  },

  getHwidUnlockCode(hwid: string): string {
    return getHwidUnlockCode(hwid);
  },

  validateHwidActivation(hwid: string, code: string): { valid: boolean; reason: 'master' | 'hwid_match' | 'request_match' | 'different_device' | 'invalid' } {
    const cleanCode = (code || '').trim();
    if (!cleanCode) return { valid: false, reason: 'invalid' };

    // 1. Código mestre do administrador Jesiel
    if (cleanCode === MASTER_UNLOCK_CODE || cleanCode === SECONDARY_UNLOCK_CODE) {
      return { valid: true, reason: 'master' };
    }

    const currentHwid = (hwid || this.getDeviceHwid()).toUpperCase().trim();
    const expectedHwidCode = getHwidUnlockCode(currentHwid);

    // 2. Chave gerada especificamente para este Hardware ID
    if (cleanCode === expectedHwidCode) {
      return { valid: true, reason: 'hwid_match' };
    }

    // 3. Solicitação aprovada especificamente para este HWID
    const requests = this.getAccessRequests();
    const matchedRequest = requests.find(r => r.hwid.toUpperCase().trim() === currentHwid && r.accessCode === cleanCode);
    if (matchedRequest) {
      return { valid: true, reason: 'request_match' };
    }

    // Verifica se o usuário digitou o código de OUTRO aparelho (tentativa de repasse)
    const matchedOtherRequest = requests.find(r => r.accessCode === cleanCode && r.hwid.toUpperCase().trim() !== currentHwid);
    if (matchedOtherRequest) {
      return { valid: false, reason: 'different_device' };
    }

    return { valid: false, reason: 'invalid' };
  },

  getTerminalState(): TerminalActivation {
    const currentHwid = this.getDeviceHwid();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TERMINAL);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...parsed,
          hwid: currentHwid,
        };
      }
    } catch {
      // ignore
    }
    return {
      hwid: currentHwid,
      status: 'bloqueado',
      licenseKey: `PCC-${currentHwid.replace(/[^A-Z0-9]/g, '')}-COMM`,
      ownerEmail: 'jesielschillo@gmail.com',
    };
  },

  setTerminalState(state: TerminalActivation) {
    localStorage.setItem(STORAGE_KEYS.TERMINAL, JSON.stringify(state));
  },

  unlockTerminal(code?: string, user?: UserAccount | null, targetHwid?: string): boolean {
    const currentHwid = targetHwid || this.getDeviceHwid();
    
    if (code) {
      const validation = this.validateHwidActivation(currentHwid, code);
      if (!validation.valid) {
        return false;
      }
    }

    const current = this.getTerminalState();
    this.setTerminalState({
      ...current,
      hwid: currentHwid,
      status: 'ativo',
      authorizedAt: new Date().toISOString(),
      activeUser: user || current.activeUser || null,
    });
    return true;
  },

  lockTerminal() {
    const current = this.getTerminalState();
    this.setTerminalState({
      ...current,
      status: 'bloqueado',
      activeUser: null,
    });
  },

  // Usuários do Sistema (Login e Senha)
  getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  },

  registerUser(userData: Omit<UserAccount, 'id' | 'createdAt'>): UserAccount {
    const users = this.getUsers();
    // Verifica se já existe username ou email
    const existingIndex = users.findIndex(
      u => u.username.toLowerCase() === userData.username.toLowerCase() ||
           u.email.toLowerCase() === userData.email.toLowerCase()
    );

    const newUser: UserAccount = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...newUser, id: users[existingIndex].id };
    } else {
      users.unshift(newUser);
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Salva silenciosamente no Supabase se configurado
    try {
      const supabase = getDynamicSupabaseClient();
      void supabase.from('users').upsert([newUser]);
    } catch {
      // ignore
    }

    return newUser;
  },

  loginUser(usernameOrEmail: string, password: string): UserAccount | null {
    const users = this.getUsers();
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const found = users.find(
      u => (u.username.toLowerCase() === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier) &&
           u.passwordHash === password.trim()
    );

    if (found) {
      const current = this.getTerminalState();
      this.setTerminalState({
        ...current,
        status: 'ativo',
        authorizedAt: new Date().toISOString(),
        activeUser: found,
      });
      return found;
    }
    return null;
  },

  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    try {
      const supabase = getDynamicSupabaseClient();
      void supabase.from('products').upsert(products);
    } catch {
      // ignore
    }
  },

  addProduct(product: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  getClients(): Client[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    return INITIAL_CLIENTS;
  },

  saveClients(clients: Client[]) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    try {
      const supabase = getDynamicSupabaseClient();
      void supabase.from('clients').upsert(clients);
    } catch {
      // ignore
    }
  },

  addClient(client: Omit<Client, 'id' | 'totalPending' | 'totalPaid' | 'installmentsPending' | 'status' | 'createdAt'> & { downPayment?: number; installmentsCount?: number; totalAmount?: number; soldItemsSummary?: string; }): Client {
    const clients = this.getClients();
    const totalAmount = client.totalAmount || 0;
    const downPayment = client.downPayment || 0;
    const installmentsCount = client.installmentsCount || 1;
    const pending = Math.max(0, totalAmount - downPayment);
    const instValue = installmentsCount > 0 && pending > 0 ? Math.round((pending / installmentsCount) * 100) / 100 : 0;

    const newClient: Client = {
      ...client,
      id: `cli-${Date.now()}`,
      email: client.email || '',
      cpf: client.cpf || '',
      soldItemsSummary: client.soldItemsSummary || 'Nenhuma compra vinculada',
      totalAmount,
      downPayment,
      installmentsCount,
      installmentValue: instValue,
      totalPending: pending,
      totalPaid: downPayment,
      installmentsPending: pending > 0 ? installmentsCount : 0,
      status: pending === 0 ? 'quitado' : 'pendente',
      createdAt: new Date().toISOString().split('T')[0]
    };
    clients.unshift(newClient);
    this.saveClients(clients);
    return newClient;
  },

  updateClientDebt(clientId: string, amountPaid: number) {
    const clients = this.getClients();
    const updated = clients.map(c => {
      if (c.id === clientId) {
        const newPending = Math.max(0, c.totalPending - amountPaid);
        const newPaid = c.totalPaid + amountPaid;
        const newInstallments = newPending === 0 ? 0 : Math.max(0, c.installmentsPending - 1);
        return {
          ...c,
          totalPending: newPending,
          totalPaid: newPaid,
          installmentsPending: newInstallments,
          status: newPending === 0 ? ('quitado' as const) : ('pendente' as const)
        };
      }
      return c;
    });
    this.saveClients(updated);
  },

  getSales(): Sale[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    return INITIAL_SALES;
  },

  addSale(sale: Omit<Sale, 'id' | 'date'>): Sale {
    const sales = this.getSales();
    const newSale: Sale = {
      ...sale,
      id: `sale-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    sales.unshift(newSale);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

    // Atualiza ou adiciona informações completas no cliente correspondente
    const clients = this.getClients();
    const existingClient = clients.find(c => c.name.toLowerCase() === sale.clientName.toLowerCase());
    const itemsSummary = sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const downPayment = sale.downPayment ?? (sale.paymentMethod === 'pix' ? sale.totalAmount : 0);
    const pendingAmount = Math.max(0, sale.totalAmount - downPayment);

    if (existingClient) {
      existingClient.soldItemsSummary = itemsSummary;
      existingClient.totalAmount = sale.totalAmount;
      existingClient.downPayment = downPayment;
      existingClient.installmentsCount = sale.installmentsCount;
      existingClient.installmentValue = sale.installmentValue;
      existingClient.totalPaid += downPayment;
      existingClient.totalPending = pendingAmount;
      existingClient.installmentsPending = sale.paymentMethod === 'parcelado_loja' && pendingAmount > 0 ? Math.max(1, sale.installmentsCount - (sale.paidInstallments || 1)) : 0;
      existingClient.status = pendingAmount === 0 ? 'quitado' : 'pendente';
      if (sale.clientEmail) existingClient.email = sale.clientEmail;
      if (sale.clientCpf) existingClient.cpf = sale.clientCpf;
      this.saveClients(clients);
    } else {
      // Cria cliente automaticamente
      this.addClient({
        name: sale.clientName,
        phone: sale.clientPhone,
        email: sale.clientEmail || '',
        cpf: sale.clientCpf || '',
        city: 'Blumenau',
        handle: `@${sale.clientName.toLowerCase().replace(/\s+/g, '')}`,
        source: 'Venda Balcão',
        soldItemsSummary: itemsSummary,
        totalAmount: sale.totalAmount,
        downPayment,
        installmentsCount: sale.installmentsCount,
      });
    }

    return newSale;
  },

  getProfile(): StoreProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
    return INITIAL_PROFILE;
  },

  saveProfile(profile: StoreProfile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getAccessRequests(): AccessRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    return INITIAL_REQUESTS;
  },

  createAccessRequest(req: Omit<AccessRequest, 'id' | 'requestedAt' | 'status' | 'accessCode'>): AccessRequest {
    const requests = this.getAccessRequests();
    // Generate simple 6-digit random code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newReq: AccessRequest = {
      ...req,
      id: `req-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      status: 'pendente',
      accessCode: randomCode
    };
    requests.unshift(newReq);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return newReq;
  },

  approveAccessRequest(requestId: string): AccessRequest | null {
    const requests = this.getAccessRequests();
    const target = requests.find(r => r.id === requestId);
    if (target) {
      target.status = 'aprovado';
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
      return target;
    }
    return null;
  },

  approveHwid(hwid: string, code?: string, buyerName?: string): AccessRequest {
    const requests = this.getAccessRequests();
    let target = requests.find(r => r.hwid.toUpperCase() === hwid.trim().toUpperCase());
    const validCode = code || getHwidUnlockCode(hwid);

    if (target) {
      target.status = 'aprovado';
      target.accessCode = validCode;
      if (buyerName) target.fullName = buyerName;
    } else {
      target = {
        id: `req-${Date.now()}`,
        hwid: hwid.trim(),
        fullName: buyerName || 'Comprador (WhatsApp/Email)',
        email: 'cliente@pccraft.com.br',
        whatsapp: ADMIN_WHATSAPP,
        storeName: 'PC Craft Hardware',
        role: 'Operador / Vendas',
        requestedAt: new Date().toISOString(),
        status: 'aprovado',
        accessCode: validCode,
      };
      requests.unshift(target);
    }
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return target;
  }
};

