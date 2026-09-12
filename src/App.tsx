import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './views/DashboardView';
import { InventoryView } from './views/InventoryView';
import { NewItemView } from './views/NewItemView';
import { ClientsView } from './views/ClientsView';
import { NewSaleView } from './views/NewSaleView';
import { ReceiptView } from './views/ReceiptView';
import { LoginView } from './views/LoginView';
import { ProfileView } from './views/ProfileView';

const MainContent: React.FC = () => {
  const { currentView, isAuthenticated } = useApp();

  if (!isAuthenticated || currentView === 'login') {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#0f172a] flex flex-col antialiased selection:bg-[#006194] selection:text-white">
      {/* Top Header with Celular and PC responsiveness */}
      <Header />

      {/* Main Screen Content - Responsive for both Mobile and Desktop PC */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'inventory' && <InventoryView />}
        {currentView === 'new_item' && <NewItemView />}
        {currentView === 'clients' && <ClientsView />}
        {currentView === 'new_sale' && <NewSaleView />}
        {currentView === 'receipt' && <ReceiptView />}
        {currentView === 'profile' && <ProfileView />}
      </main>

      {/* Persistent Bottom Navigation on mobile */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
