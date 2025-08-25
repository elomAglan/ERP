import React from 'react';

// Importez directement les pages depuis le dossier src/pages
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import PurchasesPage from './pages/PurchasesPage';
import ReportsPage from './pages/ReportsPage';
import SalesPage from './pages/SalesPage';

// --- Définir les types pour les props du composant NavItem ---
interface NavItemProps {
  pageName: string;
  label: string;
  setCurrentPage: (pageName: string) => void;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ pageName, label, setCurrentPage, isActive }) => (
  <button
    onClick={() => setCurrentPage(pageName)}
    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
      ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
  >
    {label}
  </button>
);

// --- Définir les types pour les props du composant AppRouter ---
interface AppRouterProps {
  currentPage: string;
  setCurrentPage: (pageName: string) => void;
}

const AppRouter: React.FC<AppRouterProps> = ({ currentPage, setCurrentPage }) => {
  let PageComponent: React.ComponentType | null = null;

  // Utilisez l'instruction switch pour choisir le bon composant de page
  switch (currentPage) {
    case 'DashboardPage':
      PageComponent = DashboardPage;
      break;
    case 'InventoryPage':
      PageComponent = InventoryPage;
      break;
    case 'PurchasesPage':
      PageComponent = PurchasesPage;
      break;
    case 'ReportsPage':
      PageComponent = ReportsPage;
      break;
    case 'SalesPage':
      PageComponent = SalesPage;
      break;
    default:
      PageComponent = DashboardPage; // Fallback par défaut
  }

  return (
    <div className="container mx-auto">
      <nav className="flex justify-center space-x-4 p-4 bg-white rounded-xl shadow-lg mb-8">
        <NavItem pageName="DashboardPage" label="Tableau de Bord" setCurrentPage={setCurrentPage} isActive={currentPage === "DashboardPage"} />
        <NavItem pageName="InventoryPage" label="Inventaire" setCurrentPage={setCurrentPage} isActive={currentPage === "InventoryPage"} />
        <NavItem pageName="PurchasesPage" label="Achats" setCurrentPage={setCurrentPage} isActive={currentPage === "PurchasesPage"} />
        <NavItem pageName="ReportsPage" label="Rapports" setCurrentPage={setCurrentPage} isActive={currentPage === "ReportsPage"} />
        <NavItem pageName="SalesPage" label="Ventes" setCurrentPage={setCurrentPage} isActive={currentPage === "SalesPage"} />
      </nav>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        {/* Affiche le composant de page sélectionné */}
        {PageComponent && <PageComponent />}
      </div>
    </div>
  );
};

export default AppRouter;