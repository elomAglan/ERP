// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Composants
import Sidebar from "./components/Sidebar";

// Pages
import DashboardPage from "./pages/management/DashboardPage";
import InventoryPage from "./pages/management/InventoryPage";
import PurchasesPage from "./pages/management/PurchasesPage";
import ReportsPage from "./pages/management/ReportsPage";
import SalesPage from "./pages/management/SalesPage";
import ItemsPage from "./pages/master/ItemsPage";
import ZonesPage from "./pages/master/ZonesPage";
import StoresPage from "./pages/master/StoresPage";
import SalesHistoryPage from "./pages/history/SalesHistoryPage";
import PurchaseHistoryPage from "./pages/history/PurchaseHistoryPage";
import StockInPage from "./pages/history/StockInPage";
import StockOutPage from "./pages/history/StockOutPage";
import InvoicesPage from "./pages/history/InvoicesPage"; // Importez la nouvelle page

const App: React.FC = () => {
  return (
    <div className="flex h-screen font-sans text-gray-800 bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-full">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} /> 
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/zones" element={<ZonesPage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/sales-history" element={<SalesHistoryPage />} /> 
            <Route path="/purchase-history" element={<PurchaseHistoryPage />} /> 
            <Route path="/stock-in" element={<StockInPage />} /> 
            <Route path="/stock-out" element={<StockOutPage />} /> 
            {/* Nouvelle route pour la page d'historique des factures */}
            <Route path="/invoices" element={<InvoicesPage />} /> 
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;