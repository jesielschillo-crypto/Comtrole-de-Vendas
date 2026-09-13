import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Client,
  InventoryItem,
  Sale,
  AppView,
  Installment,
  InstallmentStatus,
  AdminUser,
} from '../types';
import {
  DEMO_CLIENTS,
  DEMO_INVENTORY,
  DEMO_SALES,
} from '../data/initialData';
import { cleanUserName } from '../utils/avatarUtils';

const DEFAULT_ADMIN: AdminUser = {
  id: 'usr-admin-1',
  name: 'Thiago Almeida',
  username: 'admin',
  email: 'admin@pccraft.com.br',
  password: 'admin',
  role: 'admin',
  storeName: 'VTECH',
  phone: '(11) 99876-5432',
  pixKey: 'admin@pccraft.com.br',
  avatarUrl: '',
  createdAt: '2026-01-01',
};

interface AppContextType {
  clients: Client[];
  inventory: InventoryItem[];
  sales: Sale[];
  currentView: AppView;
  selectedSale: Sale | null;
  searchQuery: string;
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  adminName: string;
  storeName: string;
  registeredUsers: AdminUser[];
  requirePasswordOnEveryEntry: boolean;
  setRequirePasswordOnEveryEntry: (val: boolean) => void;
  setCurrentView: (view: AppView) => void;
  setSelectedSale: (sale: Sale | null) => void;
  setSearchQuery: (query: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => InventoryItem;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  adjustQuantity: (id: string, delta: number) => void;
  createSale: (
    saleData: Omit<Sale, 'id' | 'saleCode' | 'authenticationCode' | 'createdAt' | 'installments'> & {
      installmentsList?: Installment[];
    }
  ) => Sale;
  updateSale: (sale: Sale) => void;
  deleteSale: (saleId: string) => void;
  updateInstallment: (
    saleId: string,
    installmentId: string,
    updates: {
      status: InstallmentStatus;
      paidAt?: string;
      paidPaymentMethod?: string;
      paidNotes?: string;
      amount?: number;
      dueDate?: string;
    }
  ) => void;
  toggleInstallmentPaid: (saleId: string, installmentId: string) => void;
  login: (usernameOrEmail: string, password?: string) => { success: boolean; message?: string };
  registerUser: (userData: {
    name: string;
    username: string;
    password?: string;
    avatarUrl?: string;
    storeName?: string;
    email?: string;
    phone?: string;
    pixKey?: string;
    role?: 'admin' | 'vendedor';
  }) => { success: boolean; message?: string };
  deleteUserAccount: (id: string) => void;
  updateAdminProfile: (updates: Partial<AdminUser>) => void;
  logout: () => void;
  resetAllData: () => void;
  loadDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Password entry preference: true = require password every time app opens, false = enter once / remember
  const [requirePasswordOnEveryEntry, setRequirePasswordOnEveryEntryState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pccraft_require_password_always') === 'true';
    } catch {
      return false;
    }
  });

  const setRequirePasswordOnEveryEntry = (val: boolean) => {
    setRequirePasswordOnEveryEntryState(val);
    try {
      localStorage.setItem('pccraft_require_password_always', val ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  };

  // Users list
  const [registeredUsers, setRegisteredUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('pccraft_users');
      if (saved) {
        const list: AdminUser[] = JSON.parse(saved);
        return list.map(u => ({
          ...u,
          name: cleanUserName(u.name),
          avatarUrl: u.avatarUrl?.includes('photo-1535713875002-d1d0cf377fde') ? '' : u.avatarUrl || '',
        }));
      }
      return [DEFAULT_ADMIN];
    } catch {
      return [DEFAULT_ADMIN];
    }
  });

  // Logged-in admin user
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('pccraft_auth_user');
      if (saved) {
        const u = JSON.parse(saved);
        return {
          ...u,
          name: cleanUserName(u.name),
          avatarUrl: u.avatarUrl?.includes('photo-1535713875002-d1d0cf377fde') ? '' : u.avatarUrl || '',
        };
      }
      return DEFAULT_ADMIN;
    } catch {
      return DEFAULT_ADMIN;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const alwaysAsk = localStorage.getItem('pccraft_require_password_always') === 'true';
      if (alwaysAsk) return false;
      const authFlag = localStorage.getItem('pccraft_authenticated');
      // If user hasn't explicitly logged out, keep them logged in or prompt login
      return authFlag !== 'false';
    } catch {
      return true;
    }
  });

  // Flag to start clean as requested: "e pode ser tudo zerado pra mim ja montar"
  const isCleanSlateSet = typeof window !== 'undefined' && localStorage.getItem('pccraft_zerado_v1');

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      if (!isCleanSlateSet) return [];
      const saved = localStorage.getItem('pccraft_clients');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      if (!isCleanSlateSet) return [];
      const saved = localStorage.getItem('pccraft_inventory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      if (!isCleanSlateSet) return [];
      const saved = localStorage.getItem('pccraft_sales');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const alwaysAsk = localStorage.getItem('pccraft_require_password_always') === 'true';
      if (alwaysAsk) return 'login';
      const authFlag = localStorage.getItem('pccraft_authenticated');
      if (authFlag === 'false') return 'login';
      return 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const adminName = cleanUserName(currentUser?.name || 'Thiago Almeida');
  const storeName = currentUser?.storeName || 'VTECH';

  // Mark clean slate as initialized
  useEffect(() => {
    try {
      if (!localStorage.getItem('pccraft_zerado_v1')) {
        localStorage.setItem('pccraft_zerado_v1', 'true');
        localStorage.setItem('pccraft_clients', JSON.stringify([]));
        localStorage.setItem('pccraft_inventory', JSON.stringify([]));
        localStorage.setItem('pccraft_sales', JSON.stringify([]));
      }
    } catch {
      // ignore
    }
  }, []);

  // Update selectedSale if sales change
  useEffect(() => {
    if (!selectedSale && sales.length > 0) {
      setSelectedSale(sales[0]);
    }
  }, [sales, selectedSale]);

  // Persistence for users & auth
  useEffect(() => {
    try {
      localStorage.setItem('pccraft_users', JSON.stringify(registeredUsers));
    } catch (e) {
      console.error('Failed to save registered users', e);
    }
  }, [registeredUsers]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('pccraft_auth_user', JSON.stringify(currentUser));
        localStorage.setItem('pccraft_authenticated', 'true');
      } else {
        localStorage.removeItem('pccraft_auth_user');
        localStorage.setItem('pccraft_authenticated', 'false');
      }
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
  }, [currentUser]);

  // Persistence for inventory/clients/sales
  useEffect(() => {
    try {
      localStorage.setItem('pccraft_clients', JSON.stringify(clients));
    } catch (e) {
      console.error('Failed to save clients', e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('pccraft_inventory', JSON.stringify(inventory));
    } catch (e) {
      console.error('Failed to save inventory', e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('pccraft_sales', JSON.stringify(sales));
    } catch (e) {
      console.error('Failed to save sales', e);
    }
  }, [sales]);

  // Auth: Login
  const login = (usernameOrEmail: string, password?: string): { success: boolean; message?: string } => {
    const term = usernameOrEmail.trim().toLowerCase();
    const pass = (password || '').trim();

    // Find in registered users
    const matched = registeredUsers.find(
      u => u.username.toLowerCase() === term || u.email.toLowerCase() === term
    );

    if (!matched) {
      // Allow fallback if user is logging in with admin/admin default
      if ((term === 'admin' || term === 'adm') && (!pass || pass === 'admin' || pass === '123456')) {
        setCurrentUser(DEFAULT_ADMIN);
        setIsAuthenticated(true);
        setCurrentView('dashboard');
        return { success: true };
      }
      return { success: false, message: 'Usuário ou e-mail não encontrado.' };
    }

    if (matched.password && matched.password !== pass) {
      return { success: false, message: 'Senha incorreta. Verifique suas credenciais.' };
    }

    setCurrentUser(matched);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    return { success: true };
  };

  // Auth: Register User
  const registerUser = (userData: {
    name: string;
    username: string;
    password?: string;
    avatarUrl?: string;
    storeName?: string;
    email?: string;
    phone?: string;
    pixKey?: string;
    role?: 'admin' | 'vendedor';
  }): { success: boolean; message?: string } => {
    const cleanUsername = userData.username.trim().toLowerCase();
    const cleanEmail = userData.email?.trim().toLowerCase() || `${cleanUsername}@pccraft.com.br`;

    const existing = registeredUsers.find(
      u =>
        u.username.toLowerCase() === cleanUsername ||
        (u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (existing) {
      return { success: false, message: 'Este nome de usuário já está cadastrado.' };
    }

    const newUser: AdminUser = {
      id: 'usr-' + Date.now(),
      name: cleanUserName(userData.name.trim()),
      username: cleanUsername,
      password: userData.password?.trim() || '',
      avatarUrl: userData.avatarUrl || '',
      storeName: userData.storeName?.trim() || 'VTECH',
      email: cleanEmail,
      phone: userData.phone?.trim() || '',
      pixKey: userData.pixKey?.trim() || '',
      role: userData.role || 'admin',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    return { success: true };
  };

  // Auth: Delete user account
  const deleteUserAccount = (id: string) => {
    setRegisteredUsers(prev => {
      const filtered = prev.filter(u => u.id !== id);
      return filtered.length > 0 ? filtered : [DEFAULT_ADMIN];
    });
    if (currentUser?.id === id) {
      logout();
    }
  };

  // Profile: Update Admin Profile
  const updateAdminProfile = (updates: Partial<AdminUser>) => {
    if (!currentUser) return;
    const updatedUser: AdminUser = {
      ...currentUser,
      ...updates,
      ...(updates.name ? { name: cleanUserName(updates.name) } : {}),
    };
    setCurrentUser(updatedUser);
    setRegisteredUsers(prev =>
      prev.map(u => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  // Auth: Logout
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.setItem('pccraft_authenticated', 'false');
    localStorage.removeItem('pccraft_auth_user');
    setCurrentView('login');
  };

  const addClient = (data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...data,
      id: 'c-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (updated: Client) => {
    setClients(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const addInventoryItem = (
    data: Omit<InventoryItem, 'id' | 'createdAt'>
  ): InventoryItem => {
    const newItem: InventoryItem = {
      ...data,
      id: 'item-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setInventory(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateInventoryItem = (updated: InventoryItem) => {
    setInventory(prev => prev.map(item => (item.id === updated.id ? updated : item)));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const adjustQuantity = (id: string, delta: number) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQ = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQ };
        }
        return item;
      })
    );
  };

  const createSale = (
    data: Omit<Sale, 'id' | 'saleCode' | 'authenticationCode' | 'createdAt' | 'installments'> & {
      installmentsList?: Installment[];
    }
  ): Sale => {
    const randomCode = Math.floor(5020 + sales.length + 1);
    const saleId = 's-' + Date.now();
    const authCode = `PC-AUTH-${Math.floor(10000 + Math.random() * 90000)}-BR`;

    let calculatedInstallments: Installment[] = [];
    if (data.installmentsList && data.installmentsList.length > 0) {
      calculatedInstallments = data.installmentsList;
    } else if (data.installmentCount > 0 && data.remainingBalance > 0) {
      const perInstallment = Math.round((data.remainingBalance / data.installmentCount) * 100) / 100;
      const todayStr = new Date().toISOString().split('T')[0];
      const [year, month, day] = (data.firstDueDate || todayStr).split('-');
      const baseDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day) || 10);

      for (let i = 1; i <= data.installmentCount; i++) {
        const dueDateObj = new Date(baseDate);
        dueDateObj.setMonth(dueDateObj.getMonth() + (i - 1));
        const formattedDate = `${String(dueDateObj.getDate()).padStart(2, '0')}/${String(
          dueDateObj.getMonth() + 1
        ).padStart(2, '0')}/${dueDateObj.getFullYear()}`;

        calculatedInstallments.push({
          id: `inst-${saleId}-${i}`,
          saleId,
          installmentNumber: i,
          amount: perInstallment,
          dueDate: formattedDate,
          status: 'pending',
        });
      }
    } else {
      calculatedInstallments.push({
        id: `inst-${saleId}-1`,
        saleId,
        installmentNumber: 1,
        amount: data.totalAmount,
        dueDate: 'À vista',
        paidAt: new Date().toLocaleDateString('pt-BR'),
        paidPaymentMethod: data.paymentMethod === 'pix_vista' ? 'PIX' : 'Dinheiro',
        status: 'paid',
      });
    }

    const newSale: Sale = {
      ...data,
      id: saleId,
      saleCode: `#PC-${randomCode}`,
      authenticationCode: authCode,
      createdAt: new Date().toISOString().split('T')[0],
      installments: calculatedInstallments,
    };

    setSales(prev => [newSale, ...prev]);
    setSelectedSale(newSale);
    return newSale;
  };

  const updateSale = (updated: Sale) => {
    setSales(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    if (selectedSale && selectedSale.id === updated.id) {
      setSelectedSale(updated);
    }
  };

  const deleteSale = (saleId: string) => {
    setSales(prev => prev.filter(s => s.id !== saleId));
    if (selectedSale && selectedSale.id === saleId) {
      setSelectedSale(null);
    }
  };

  const updateInstallment = (
    saleId: string,
    installmentId: string,
    updates: {
      status: InstallmentStatus;
      paidAt?: string;
      paidPaymentMethod?: string;
      paidNotes?: string;
      amount?: number;
      dueDate?: string;
    }
  ) => {
    setSales(prev =>
      prev.map(sale => {
        if (sale.id !== saleId) return sale;
        const updatedInst = sale.installments.map(inst => {
          if (inst.id !== installmentId) return inst;
          return {
            ...inst,
            ...updates,
          };
        });

        const allPaid = updatedInst.every(inst => inst.status === 'paid');
        const anyOverdue = updatedInst.some(inst => inst.status === 'overdue');
        const newStatus = allPaid ? 'completed' : anyOverdue ? 'overdue' : 'active';

        const remaining = updatedInst
          .filter(i => i.status !== 'paid')
          .reduce((sum, i) => sum + i.amount, 0);

        const updatedSale: Sale = {
          ...sale,
          installments: updatedInst,
          remainingBalance: remaining,
          status: newStatus,
        };

        if (selectedSale && selectedSale.id === saleId) {
          setSelectedSale(updatedSale);
        }

        return updatedSale;
      })
    );
  };

  const toggleInstallmentPaid = (saleId: string, installmentId: string) => {
    setSales(prev =>
      prev.map(sale => {
        if (sale.id !== saleId) return sale;
        const updatedInst = sale.installments.map(inst => {
          if (inst.id !== installmentId) return inst;
          const isNowPaid = inst.status !== 'paid';
          return {
            ...inst,
            status: (isNowPaid ? 'paid' : 'pending') as InstallmentStatus,
            paidAt: isNowPaid ? new Date().toLocaleDateString('pt-BR') : undefined,
            paidPaymentMethod: isNowPaid ? 'PIX' : undefined,
          };
        });

        const allPaid = updatedInst.every(inst => inst.status === 'paid');
        const anyOverdue = updatedInst.some(inst => inst.status === 'overdue');
        const newStatus = allPaid ? 'completed' : anyOverdue ? 'overdue' : 'active';

        const remaining = updatedInst
          .filter(i => i.status !== 'paid')
          .reduce((sum, i) => sum + i.amount, 0);

        const updatedSale = {
          ...sale,
          installments: updatedInst,
          remainingBalance: remaining,
          status: newStatus,
        };

        if (selectedSale && selectedSale.id === saleId) {
          setSelectedSale(updatedSale);
        }

        return updatedSale;
      })
    );
  };

  const resetAllData = () => {
    setClients([]);
    setInventory([]);
    setSales([]);
    setSelectedSale(null);
    localStorage.setItem('pccraft_clients', JSON.stringify([]));
    localStorage.setItem('pccraft_inventory', JSON.stringify([]));
    localStorage.setItem('pccraft_sales', JSON.stringify([]));
    localStorage.setItem('pccraft_zerado_v1', 'true');
  };

  const loadDemoData = () => {
    setClients(DEMO_CLIENTS);
    setInventory(DEMO_INVENTORY);
    setSales(DEMO_SALES);
    setSelectedSale(DEMO_SALES[0]);
    localStorage.setItem('pccraft_clients', JSON.stringify(DEMO_CLIENTS));
    localStorage.setItem('pccraft_inventory', JSON.stringify(DEMO_INVENTORY));
    localStorage.setItem('pccraft_sales', JSON.stringify(DEMO_SALES));
    localStorage.setItem('pccraft_zerado_v1', 'true');
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        inventory,
        sales,
        currentView,
        selectedSale,
        searchQuery,
        isAuthenticated,
        currentUser,
        adminName,
        storeName,
        registeredUsers,
        requirePasswordOnEveryEntry,
        setRequirePasswordOnEveryEntry,
        deleteUserAccount,
        setCurrentView,
        setSelectedSale,
        setSearchQuery,
        addClient,
        updateClient,
        deleteClient,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        adjustQuantity,
        createSale,
        updateSale,
        deleteSale,
        updateInstallment,
        toggleInstallmentPaid,
        login,
        registerUser,
        updateAdminProfile,
        logout,
        resetAllData,
        loadDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
