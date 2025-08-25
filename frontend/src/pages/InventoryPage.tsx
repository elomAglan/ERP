import React from 'react';
import { FaReceipt, FaUsers, FaBoxOpen, FaClipboardList, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- PurchasesPage Component ---
const PurchasesPage: React.FC = () => {
  // Mock data for demonstration
  const purchasesOverview = [
    { title: 'Monthly Purchases', value: '$6,200', icon: <FaReceipt className="text-orange-500" />, change: '+8% Last Month' },
    { title: 'Pending Orders', value: '10', icon: <FaClipboardList className="text-blue-500" />, change: '3 new' },
    { title: 'Active Suppliers', value: '35', icon: <FaUsers className="text-yellow-500" />, change: '+1 this month' },
    { title: 'Total Stock Value', value: '$25,000', icon: <FaBoxOpen className="text-purple-500" />, change: '+5% Last Quarter' },
  ];

  const openPurchaseOrders = [
    { id: 'PO-008', supplier: 'Supplier A', total: '$850', status: 'Ordered', date: '2025-08-22' },
    { id: 'PO-007', supplier: 'Supplier B', total: '$1,500', status: 'Partially Received', date: '2025-08-19' },
    { id: 'PO-006', supplier: 'Supplier C', total: '$200', status: 'New', date: '2025-08-16' },
  ];

  const recentPurchases = [
    { id: 'PUR-012', supplier: 'Supplier D', amount: '$700', date: '3 hours ago' },
    { id: 'PUR-011', supplier: 'Supplier A', amount: '$850', date: 'Yesterday' },
    { id: 'PUR-010', supplier: 'Supplier E', amount: '$300', date: '2 days ago' },
    { id: 'PUR-009', supplier: 'Supplier B', amount: '$1500', date: '4 days ago' },
    { id: 'PUR-008', supplier: 'Supplier F', amount: '$120', date: '1 week ago' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 text-gray-900 min-h-screen bg-gray-100"
    >
      <h1 className="text-4xl font-bold mb-8 text-orange-600">Purchases Management</h1>

      {/* --- Purchases Overview --- */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {purchasesOverview.map((item, index) => (
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
              <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{item.value}</h3>
              <p className="text-green-600 text-sm">{item.change}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Open Purchase Orders --- */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Open Purchase Orders</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          {openPurchaseOrders.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {openPurchaseOrders.map((order, index) => (
                <li key={index} className="py-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-lg font-medium text-gray-900">{order.id} - {order.supplier}</p>
                    <p className="text-sm text-gray-600">
                      Total: <span className="font-bold text-gray-900">{order.total}</span> | 
                      Status: <span className="text-blue-600">{order.status}</span> | Date: {order.date}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
                    Details <FaArrowRight className="inline-block ml-2" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No open purchase orders.</p>
          )}
        </motion.div>
      </section>

      {/* --- Recent Purchases --- */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Recent Purchases</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          {recentPurchases.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentPurchases.map((purchase, index) => (
                <li key={index} className="py-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-lg font-medium text-gray-900">{purchase.id} for {purchase.supplier}</p>
                    <p className="text-sm text-gray-600">{purchase.date}</p>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{purchase.amount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent purchases to display.</p>
          )}
        </motion.div>
      </section>
    </motion.div>
  );
};

export default PurchasesPage;
