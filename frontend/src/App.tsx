import React from "react";
import { Routes, Route } from "react-router-dom";

// Composants
import Sidebar from "./components/Sidebar";

// Pages
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import PurchasesPage from "./pages/PurchasesPage";
import ReportsPage from "./pages/ReportsPage";
import SalesPage from "./pages/SalesPage";

const App: React.FC = () => {
  return (
    <div className="flex h-screen font-sans text-gray-800 bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-full">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/sales" element={<SalesPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
