import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  FaUserCircle,
  FaSignOutAlt,
  FaBell,
  FaChevronLeft,
  FaChevronDown,
} from "react-icons/fa";
import { motion } from "framer-motion";

export type SidebarProps = {
  className?: string;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
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

const Sidebar: React.FC<SidebarProps> = ({ className, setIsAuthenticated }) => {
  const [openSection, setOpenSection] = useState<string | null>("Management");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userDisplayName = localStorage.getItem("username") || "Admin Manager";

  const menuSections: MenuSectionData[] = [
    {
      title: "Management",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt />, badge: 3 },
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
      title: "Masters",
      items: [
        { name: "Items", path: "/items", icon: <FaBook /> },
        { name: "Stores", path: "/stores", icon: <FaStore /> },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    
    setIsAuthenticated(false);
    
    navigate("/login");
  };

  const handleProfileClick = () => {
    if (!isCollapsed) {
      navigate("/profile");
    }
  };

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className={`bg-white text-gray-800 h-screen flex flex-col border-r border-gray-200 shadow-md ${className}`}
    >
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && <h1 className="text-2xl font-bold text-blue-600">ERP12</h1>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaChevronLeft className={`${isCollapsed ? "rotate-180" : ""} text-gray-500 transition-transform duration-300`} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto mt-2 px-2">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-2">
            {!isCollapsed && (
              <button
                onClick={() => toggleSection(section.title)}
                className="flex justify-between items-center w-full px-4 py-2 text-gray-800 text-sm font-bold uppercase hover:bg-gray-100 rounded-lg transition-colors"
                aria-expanded={openSection === section.title}
              >
                {section.title}
                <FaChevronDown
                  className={`${openSection === section.title ? "rotate-180" : ""} transition-transform duration-300`}
                />
              </button>
            )}

            {isCollapsed && (
              <div className="flex justify-center my-4">
                <span className="text-gray-600 text-base font-bold uppercase">{section.title[0]}</span>
              </div>
            )}

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isCollapsed || openSection === section.title
                  ? "max-h-screen opacity-100"
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
                    title={isCollapsed ? item.name : ''}
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

      {/* Sidebar Footer (user profile and actions) */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        {/* Clickable Profile Section */}
        <div 
          className={`flex items-center gap-3 mb-2 ${!isCollapsed ? 'cursor-pointer hover:bg-gray-100 rounded-lg p-2 -ml-2 -mt-2 transition-colors' : ''}`}
          onClick={handleProfileClick}
          aria-label="Manage Profile"
          title="Manage Profile"
        >
          <FaUserCircle className="w-8 h-8 text-gray-600" />
          {!isCollapsed && (
            <div>
              <p className="text-sm font-semibold text-gray-800">{userDisplayName}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Notifications Button */}
          <button
            className="p-2 text-gray-500 hover:text-gray-800 transition-colors relative"
            aria-label="Notifications"
            title="Notifications"
          >
            <FaBell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">!</span>
          </button>

          {!isCollapsed && (
            <button
              className="p-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
              aria-label="Sign out"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;