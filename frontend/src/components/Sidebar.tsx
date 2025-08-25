import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaShoppingCart,
  FaBoxOpen,
  FaReceipt,
  FaChartBar,
  FaHistory,
  FaExchangeAlt,
  FaFileInvoice,
  FaTruckLoading,
  FaTruckMoving,
  FaBook,
  FaStore,
  FaMapMarkerAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaBell,
  FaChevronLeft,
  FaChevronDown,
} from "react-icons/fa";
import { motion } from "framer-motion";

type SidebarProps = {
  className?: string;
};

type MenuItemData = {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  isNew?: boolean;
};

type MenuSectionData = {
  title: string;
  items: MenuItemData[];
};

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  // Set default open section to 'Management' for initial view
  const [openSection, setOpenSection] = useState<string | null>("Management");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const location = useLocation();

  const menuSections: MenuSectionData[] = [
    {
      title: "Management",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt />, badge: 3 }, // Assuming /dashboard is your main dashboard route
        { name: "Sales", path: "/sales", icon: <FaShoppingCart />, badge: 12 },
        { name: "Purchases", path: "/purchases", icon: <FaReceipt /> },
        { name: "Inventory", path: "/inventory", icon: <FaBoxOpen />, badge: 7 },
        { name: "Reports", path: "/reports", icon: <FaChartBar />, isNew: true },
      ],
    },
    {
      title: "History",
      items: [
        { name: "Sales History", path: "/sales-history", icon: <FaHistory /> },
        { name: "Purchase History", path: "/purchase-history", icon: <FaExchangeAlt /> },
        { name: "Invoices", path: "/invoices", icon: <FaFileInvoice /> },
        { name: "Stock In Movements", path: "/stock-in", icon: <FaTruckLoading /> },
        { name: "Stock Out Movements", path: "/stock-out", icon: <FaTruckMoving /> },
      ],
    },
    {
      title: "Masters", // Renamed 'Masters' as per your provided code
      items: [
        { name: "Items", path: "/items", icon: <FaBook /> },
        { name: "Stores", path: "/stores", icon: <FaStore /> },
        { name: "Zones", path: "/zones", icon: <FaMapMarkerAlt /> },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className={`bg-white text-gray-800 h-screen flex flex-col border-r border-gray-200 shadow-md ${className}`}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && <h1 className="text-2xl font-bold text-blue-600">ERP12</h1>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <FaChevronLeft className={`${isCollapsed ? "rotate-180" : ""} text-gray-500 transition-transform duration-300`} />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto mt-2 px-2">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-2"> {/* Added margin-bottom for spacing */}
            {!isCollapsed && (
              <button
                onClick={() => toggleSection(section.title)}
                // MODIFICATION: Rendre le titre de section plus visible
                className="flex justify-between items-center w-full px-4 py-2 text-gray-800 text-sm font-bold uppercase hover:bg-gray-100 rounded-lg transition-colors"
                aria-expanded={openSection === section.title}
              >
                {section.title}
                <FaChevronDown
                  className={`${openSection === section.title ? "rotate-180" : ""} transition-transform duration-300`}
                />
              </button>
            )}

            {/* Always show section title when collapsed, but as a tooltip or simple icon */}
            {isCollapsed && (
              <div className="flex justify-center my-4">
                {/* MODIFICATION: Rendre la première lettre du titre de section plus grande et plus audacieuse */}
                <span className="text-gray-600 text-base font-bold uppercase">{section.title[0]}</span>
              </div>
            )}

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isCollapsed || openSection === section.title
                  ? "max-h-screen opacity-100" // Use max-h-screen for potentially larger sections
                  : "max-h-0 opacity-0"
              }`}
            >
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 p-2 my-1 rounded-lg w-full text-left transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.name : ''} // Add tooltip for collapsed state
                  >
                    {item.icon}
                    {!isCollapsed && <span>{item.name}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full min-w-[20px] text-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                    {!isCollapsed && item.isNew && (
                      <span className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded-full">
                        New
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 mb-2">
          <FaUserCircle className="w-8 h-8 text-gray-600" />
          {!isCollapsed && (
            <div>
              <p className="text-sm font-semibold">Admin Manager</p>
              <p className="text-xs text-gray-500">admin@nexuserp.com</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors relative" aria-label="Notifications">
            <FaBell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          {!isCollapsed && (
            <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors" aria-label="Sign out">
              <FaSignOutAlt className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
