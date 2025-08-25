import React from 'react';
import { FaDollarSign, FaShoppingCart, FaBox, FaChartLine, FaClipboardList } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- DashboardPage Component ---
const DashboardPage: React.FC = () => {
  const kpis = [
    { title: 'Total Sales', value: '$12,345', icon: <FaDollarSign className="text-green-500" />, change: '+5% Last Month' },
    { title: 'New Orders', value: '25', icon: <FaShoppingCart className="text-blue-500" />, change: '+10% Last Week' },
    { title: 'Current Stock Value', value: '$8,765', icon: <FaBox className="text-yellow-500" />, change: '-2% Last Quarter' },
    { title: 'Open Invoices', value: '15', icon: <FaClipboardList className="text-purple-500" />, change: '3 Overdue' },
  ];

  const recentActivities = [
    { type: 'Sale', description: 'Order #1001 for John Doe', date: '2 hours ago', amount: '$250' },
    { type: 'Purchase', description: 'Received 50 units of Item A from Supplier X', date: 'Yesterday', amount: '$1200' },
    { type: 'Stock Out', description: 'Shipped 10 units of Item B', date: 'Yesterday', amount: '' },
    { type: 'Sale', description: 'Order #1000 for Jane Smith', date: '2 days ago', amount: '$400' },
    { type: 'Invoice', description: 'Invoice #F2025-001 sent to ABC Corp', date: '3 days ago', amount: '$1500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 min-h-screen bg-gray-100 text-gray-900"
    >
      <h1 className="text-4xl font-bold mb-8 text-blue-700">Dashboard Overview</h1>

      {/* --- KPIs Section --- */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-start hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="text-3xl p-3 bg-gray-100 rounded-full">{kpi.icon}</div>
                <p className="text-sm text-gray-500 font-medium">{kpi.title}</p>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{kpi.value}</h3>
              <p className="text-green-600 text-sm">{kpi.change}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Charts Section (Placeholder) --- */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Trends & Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-6 h-80 flex items-center justify-center"
          >
            <FaChartLine className="text-blue-500 text-6xl opacity-50" />
            <p className="text-gray-500 ml-4">Sales Trend Chart (Placeholder)</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-6 h-80 flex items-center justify-center"
          >
            <FaChartLine className="text-purple-500 text-6xl opacity-50" />
            <p className="text-gray-500 ml-4">Inventory Movement Chart (Placeholder)</p>
          </motion.div>
        </div>
      </section>

      {/* --- Recent Activity Section --- */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Recent Activity</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          {recentActivities.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentActivities.map((activity, index) => (
                <li key={index} className="py-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-lg font-medium text-gray-800">
                      <span className={`font-bold ${activity.type === 'Sale' ? 'text-green-600' : activity.type === 'Purchase' ? 'text-yellow-600' : 'text-blue-600'}`}>
                        {activity.type}:
                      </span> {activity.description}
                    </p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                  {activity.amount && (
                    <span className={`text-lg font-bold ${activity.type === 'Sale' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {activity.amount}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center py-8">No recent activity to display.</p>
          )}
        </motion.div>
      </section>
    </motion.div>
  );
};

export default DashboardPage;
