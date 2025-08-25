import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Importation de Navigate

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

const App: React.FC = () => {
  return (
    <div className="flex h-screen font-sans text-gray-800 bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-full">
          <Routes>
            {/* Redirige le chemin racine vers /dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* La page du tableau de bord est maintenant sur /dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} /> 

            {/* Vos autres routes existantes */}
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/zones" element={<ZonesPage />} />
            <Route path="/stores" element={<StoresPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;