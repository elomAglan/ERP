// src/App.tsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Composants
import Sidebar from "./components/Sidebar";
import PrivateRoute from "./components/PrivateRoute";

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
import InvoicesPage from "./pages/history/InvoicesPage";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import ProfileManagementPage from "./pages/user/ProfileManagementPage";

const App: React.FC = () => {
  const [, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  return (
    <Routes>
      {/* Routes publiques */}
      <Route
        path="/login"
        element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
      />
      <Route path="/register" element={<Register />} />

      {/* Routes privées */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <div className="flex h-screen font-sans text-gray-800 bg-gray-100">
              <Sidebar setIsAuthenticated={setIsAuthenticated} />
              <main className="flex-1 p-8 overflow-auto">
                <div className="min-h-full">
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
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/profile" element={<ProfileManagementPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
          </PrivateRoute>
        }
      />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
