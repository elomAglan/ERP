import React from 'react';
import { FaShoppingCart, FaTag, FaUsers, FaClipboardList, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- SalesPage Component ---
const SalesPage: React.FC = () => {
  const salesOverview = [
    { title: 'Monthly Sales', value: '$8,500', icon: <FaShoppingCart className="text-green-500" />, change: '+12% Last Month' },
    { title: 'Pending Orders', value: '18', icon: <FaClipboardList className="text-blue-500" />, change: '2 new' },
    { title: 'Active Customers', value: '120', icon: <FaUsers className="text-yellow-500" />, change: '+5 this month' },
    { title: 'Avg. Order Value', value: '$180', icon: <FaTag className="text-purple-500" />, change: '-3% Last Quarter' },
  ];

  const openOrders = [
    { id: 'ORD-005', customer: 'Alice Dupont', total: '$320', status: 'In Preparation', date: '2025-08-20' },
    { id: 'ORD-004', customer: 'Bob Martin', total: '$1,100', status: 'Pending Payment', date: '2025-08-18' },
    { id: 'ORD-003', customer: 'Carole Leroy', total: '$75', status: 'New', date: '2025-08-15' },
  ];

  const recentSales = [
    { id: 'VEN-009', customer: 'John Doe', amount: '$250', date: '2 hours ago' },
    { id: 'VEN-008', customer: 'Jane Smith', amount: '$400', date: 'Yesterday' },
    { id: 'VEN-007', customer: 'Alice Dupont', amount: '$320', date: '2 days ago' },
    { id: 'VEN-006', customer: 'Robert Johnson', amount: '$150', date: '3 days ago' },
    { id: 'VEN-005', customer: 'Marie Curie', amount: '$600', date: '1 week ago' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 text-gray-900 min-h-screen bg-gray-100"
    >
      <h1 className="text-4xl font-bold mb-8 text-green-600">Sales Management</h1>

      {/* --- Sales Overview --- */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {salesOverview.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="text-3xl p-3 bg-gray-100 rounded-full">{item.icon}</div>
                <p className="text-sm text-gray-600 font-medium">{item.title}</p>
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-2">{item.value}</h3>
              <p className="text-green-600 text-sm">{item.change}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Open Orders --- */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Open Orders</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          {openOrders.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {openOrders.map((order, index) => (
                <li key={index} className="py-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-lg font-medium text-gray-900">{order.id} - {order.customer}</p>
                    <p className="text-sm text-gray-600">Total: <span className="font-bold text-gray-900">{order.total}</span> | Status: <span className="text-blue-600">{order.status}</span> | Date: {order.date}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 transition-colors">
                    Details <FaArrowRight className="inline-block ml-2" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No open orders.</p>
          )}
        </motion.div>
      </section>

      {/* --- Recent Sales --- */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Recent Sales</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          {recentSales.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentSales.map((sale, index) => (
                <li key={index} className="py-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-lg font-medium text-gray-900">{sale.id} for {sale.customer}</p>
                    <p className="text-sm text-gray-600">{sale.date}</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">{sale.amount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent sales to display.</p>
          )}
        </motion.div>
      </section>
    </motion.div>
  );
};

export default SalesPage;
