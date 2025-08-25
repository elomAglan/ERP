import React from 'react';
import { FaChartPie, FaChartLine, FaChartBar, FaFileAlt, FaDownload, FaPrint, FaShareAlt, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- ReportsPage Component ---
const ReportsPage: React.FC = () => {
  const reportCategories = [
    { title: 'Financial Reports', description: 'Profit & Loss, Balance Sheet, Cash Flow', icon: <FaChartPie className="text-blue-500" /> },
    { title: 'Sales Reports', description: 'Sales by Product, Customer, Region', icon: <FaChartLine className="text-green-500" /> },
    { title: 'Inventory Reports', description: 'Stock Levels, Valuation, Movements', icon: <FaChartBar className="text-purple-500" /> },
  ];

  const availableReports = [
    { name: 'Monthly Profit & Loss', type: 'Financial', lastRun: '2025-08-31', status: 'Generated' },
    { name: 'Q3 Sales Performance', type: 'Sales', lastRun: '2025-08-25', status: 'Up-to-date' },
    { name: 'Current Stock Valuation', type: 'Inventory', lastRun: '2025-08-24', status: 'Generated' },
    { name: 'Supplier Performance', type: 'Purchases', lastRun: '2025-08-20', status: 'Up-to-date' },
    { name: 'Customer Sales Analysis', type: 'Sales', lastRun: '2025-08-18', status: 'Scheduled' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 text-gray-900 min-h-screen bg-gray-100"
    >
      <h1 className="text-4xl font-bold mb-8 text-blue-600">Reports Overview</h1>

      {/* --- Report Categories --- */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Report Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="text-4xl p-3 bg-gray-100 rounded-full mb-4">{category.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-gray-600 text-sm">{category.description}</p>
              <button className="mt-4 text-blue-600 hover:text-blue-800 transition-colors flex items-center font-medium">
                View Reports <FaArrowRight className="inline-block ml-2" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Available Reports --- */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Available Reports</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          {availableReports.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {availableReports.map((report, index) => (
                <li key={index} className="py-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-lg font-medium text-gray-900">
                      <FaFileAlt className="inline-block mr-2 text-gray-500" />
                      {report.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type: <span className="font-bold text-gray-900">{report.type}</span> | Last Run: {report.lastRun} | Status: <span className="text-green-600">{report.status}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="text-blue-600 hover:text-blue-800 transition-colors" aria-label="Download Report">
                      <FaDownload className="w-5 h-5" />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 transition-colors" aria-label="Print Report">
                      <FaPrint className="w-5 h-5" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-800 transition-colors" aria-label="Share Report">
                      <FaShareAlt className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No reports available.</p>
          )}
        </motion.div>
      </section>
    </motion.div>
  );
};

export default ReportsPage;
