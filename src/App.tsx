import React, { useState } from 'react';
import { StorageManager, DEFAULT_HWID } from './lib/storage';
import { Product, Client, Sale, StoreProfile } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LockScreen } from './components/LockScreen';
import { DashboardView } from './components/DashboardView';
import { NewSaleView } from './components/NewSaleView';
import { ClientsView } from './components/ClientsView';
import { ProfileView } from './components/ProfileView';
import { EditProfileModal } from './components/EditProfileModal';
import { AdminRequestsModal } from './components/AdminRequestsModal';
import { QuickApprovalScreen } from './components/QuickApprovalScreen';

const cleanDemoDataOnFirstRun = () => {
  if (typeof window === 'undefined' || localStorage.getItem('pc_craft_clean_slate_v1')) return;

  localStorage.removeItem('pc_craft_products');
  localStorage.removeItem('pc_craft_clients');
  localStorage.removeItem('pc_craft_sales');
  localStorage.removeItem('pc_craft_store_profile');
  localStorage.removeItem('pc_craft_access_requests');
  localStorage.removeItem('pc_craft_users');
  localStorage.removeItem('pc_craft_terminal_state');
  localStorage.setItem('pc_craft_clean_slate_v1', 'true');
};

cleanDemoDataOnFirstRun();

export default function App() {
  // Verificação de URL para liberação com 1 clique do Jesiel
  const [urlParams] = useState(() => {
    try {
      return new URLSearchParams(window.location.search);
    } catch {
      return new URLSearchParams();
    }
  });
  const approveHwid = urlParams.get('approve_hwid');
  const buyerName = urlParams.get('buyer_name') || undefined;
  const [showApprovalPortal, setShowApprovalPortal] = useState<boolean>(!!approveHwid);

  // Terminal authorization status
  const [terminalState, setTerminalState] = useState(() => StorageManager.getTerminalState());
  const [currentTab, setCurrentTab] = useState<string>('inicio');

  // App domain state
  const [products, setProducts] = useState<Product[]>(() => StorageManager.getProducts());
  const [clients, setClients] = useState<Client[]>(() => StorageManager.getClients());
  const [sales, setSales] = useState<Sale[]>(() => StorageManager.getSales());
  const [profile, setProfile] = useState<StoreProfile>(() => StorageManager.getProfile());

  // Modal states
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

  // Cross-screen interactions
  const [selectedProductForSale, setSelectedProductForSale] = useState<Product | null>(null);
  const [quickWhatsappClient, setQuickWhatsappClient] = useState<Client | null>(null);

  // Sync state with storage on changes
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const created = StorageManager.addProduct(newProd);
    setProducts(StorageManager.getProducts());
  };

  const handleSelectProductForSale = (prod: Product) => {
    setSelectedProductForSale(prod);
    setCurrentTab('nova-venda');
  };

  const handleCompleteSale = (saleData: Omit<Sale, 'id' | 'date'>) => {
    StorageManager.addSale(saleData);
    setSales(StorageManager.getSales());
    setClients(StorageManager.getClients());
    setSelectedProductForSale(null);
  };

  const handleAddClient = (clientData: Omit<Client, 'id' | 'totalPending' | 'totalPaid' | 'installmentsPending' | 'status' | 'createdAt'>) => {
    const created = StorageManager.addClient(clientData);
    setClients(StorageManager.getClients());
    return created;
  };

  const handlePayInstallment = (clientId: string, amount: number) => {
    StorageManager.updateClientDebt(clientId, amount);
    setClients(StorageManager.getClients());
  };

  const handleSaveProfile = (newProfile: StoreProfile) => {
    StorageManager.saveProfile(newProfile);
    setProfile(newProfile);
  };

  const handleLockTerminal = () => {
    StorageManager.lockTerminal();
    setTerminalState(StorageManager.getTerminalState());
  };

  const handleUnlockTerminal = (code?: string) => {
    StorageManager.unlockTerminal(code);
    setTerminalState(StorageManager.getTerminalState());
    setIsAdminModalOpen(false);
  };

  const handleForceSync = () => {
    setProducts(StorageManager.getProducts());
    setClients(StorageManager.getClients());
    setSales(StorageManager.getSales());
  };

  const handleQuickChargeWhatsapp = (client: Client) => {
    setQuickWhatsappClient(client);
    setCurrentTab('clientes');
  };

  // Pending clients count for badge
  const pendingClientsCount = clients.filter((c) => c.totalPending > 0).length;
  const accessRequests = StorageManager.getAccessRequests();
  const pendingRequestsCount = accessRequests.filter((r) => r.status === 'pendente').length;

  // Se Jesiel clicou no link recebido no WhatsApp ou E-mail para liberar um cliente
  if (showApprovalPortal && approveHwid) {
    return (
      <QuickApprovalScreen
        hwidToApprove={approveHwid}
        buyerName={buyerName}
        onGoToApp={() => {
          setShowApprovalPortal(false);
          // Remove query params from address bar cleanly
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      />
    );
  }

  // Se o terminal estiver bloqueado, exibe a tela de ativação/código de acesso
  if (terminalState.status === 'bloqueado') {
    return (
      <>
        <LockScreen
          onUnlocked={() => handleUnlockTerminal()}
          onOpenAdminPanel={() => setIsAdminModalOpen(true)}
        />
        <AdminRequestsModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onUnlockTerminalDirectly={(code) => handleUnlockTerminal(code)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between selection:bg-[#c6e7ff] selection:text-[#00344f]">
      {/* Top Header */}
      <Header
        profile={profile}
        currentTab={currentTab}
        onOpenProfile={() => setCurrentTab('perfil')}
        onLockTerminal={handleLockTerminal}
        onOpenAdminPanel={() => setIsAdminModalOpen(true)}
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* Main Tab Views */}
      <main className="flex-1">
        {currentTab === 'inicio' && (
          <DashboardView
            clients={clients}
            products={products}
            sales={sales}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenNewSale={() => setCurrentTab('nova-venda')}
            onQuickChargeWhatsapp={handleQuickChargeWhatsapp}
          />
        )}

        {currentTab === 'nova-venda' && (
          <NewSaleView
            clients={clients}
            products={products}
            selectedProduct={selectedProductForSale}
            onCompleteSale={handleCompleteSale}
            onAddClientQuick={handleAddClient}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'clientes' && (
          <ClientsView
            clients={clients}
            onAddClient={handleAddClient}
            onPayInstallment={handlePayInstallment}
            quickOpenWhatsappClient={quickWhatsappClient}
          />
        )}

        {currentTab === 'perfil' && (
          <ProfileView
            profile={profile}
            clients={clients}
            sales={sales}
            products={products}
            onOpenEditModal={() => setIsEditProfileOpen(true)}
            onLockTerminal={handleLockTerminal}
            onSyncSupabase={handleForceSync}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'clientes') setQuickWhatsappClient(null);
          setCurrentTab(tab);
        }}
        pendingClientsCount={pendingClientsCount}
      />

      {/* Modal Editar Perfil (HTML Imagem 5) */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Modal ADM - Aprovações & Códigos de Ativação */}
      <AdminRequestsModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onUnlockTerminalDirectly={(code) => handleUnlockTerminal(code)}
      />
    </div>
  );
}
