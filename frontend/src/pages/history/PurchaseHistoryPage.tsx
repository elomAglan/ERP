import React, { useState, useEffect } from 'react';
import {  FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- Interfaces ---
interface Purchase {
    id: number;
    item: string; // Assuming purchases also have an item name
    supplier: string;
    date: string; // ISO string format
    totalAmount: number;
    status: "pending_payment" | "paid"; // Added status for purchase payments
}

// --- Mock Data for Purchases ---
const mockPurchases: Purchase[] = [
    { id: 101, item: 'New accounting software', supplier: 'Tech Solutions', date: '2025-08-21', totalAmount: 1800000, status: 'paid' },
    { id: 102, item: 'Office supplies batch', supplier: 'Office Depot', date: '2025-08-20', totalAmount: 600000, status: 'pending_payment' },
    { id: 103, item: 'Dev Tools Licenses', supplier: 'Software Hub', date: '2025-08-17', totalAmount: 1500000, status: 'paid' },
    { id: 104, item: 'Cloud Server Upgrade', supplier: 'AWS Reseller', date: '2025-08-16', totalAmount: 300000, status: 'pending_payment' },
    { id: 105, item: 'Consulting services', supplier: 'Global Advisors', date: '2025-08-14', totalAmount: 750000, status: 'paid' },
    { id: 106, item: 'Marketing software subscription', supplier: 'Marketing Pros', date: '2025-08-12', totalAmount: 250000, status: 'paid' },
    { id: 107, item: 'Server hardware', supplier: 'Dell Inc.', date: '2025-08-10', totalAmount: 2200000, status: 'pending_payment' },
    { id: 108, item: 'Networking equipment', supplier: 'Cisco Partners', date: '2025-08-08', totalAmount: 800000, status: 'paid' },
    { id: 109, item: 'Employee training module', supplier: 'LearnTech', date: '2025-08-05', totalAmount: 100000, status: 'paid' },
    { id: 110, item: 'Office furniture', supplier: 'IKEA Business', date: '2025-08-01', totalAmount: 400000, status: 'pending_payment' },
];

// --- Utility Functions ---
const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'long', year: 'numeric' }).format(
        new Date(dateString)
    );

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XOF' }).format(amount);

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending_payment': return 'bg-red-100 text-red-800'; // Changed to red for pending purchase payments
        case 'paid': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const PurchaseHistoryPage: React.FC = () => {
    const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
    const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'pending_payment' | 'paid'>('All');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // Default items per page

    useEffect(() => {
        // Sort purchases by date, most recent first
        const sortedPurchases = [...mockPurchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllPurchases(sortedPurchases);
        setFilteredPurchases(sortedPurchases); // Initially, show all purchase history
        setCurrentPage(1); // Reset to first page on data load
    }, []);

    // Apply filters and search
    useEffect(() => {
        let currentFilteredPurchases = allPurchases;

        // Filter by status
        if (filterStatus !== 'All') {
            currentFilteredPurchases = currentFilteredPurchases.filter(purchase => purchase.status === filterStatus);
        }

        // Filter by date range
        if (filterStartDate && filterEndDate) {
            const start = new Date(filterStartDate).setHours(0, 0, 0, 0);
            const end = new Date(filterEndDate).setHours(23, 59, 59, 999);
            currentFilteredPurchases = currentFilteredPurchases.filter(purchase => {
                const purchaseDate = new Date(purchase.date).getTime();
                return purchaseDate >= start && purchaseDate <= end;
            });
        } else if (filterStartDate && !filterEndDate) { // Only start date filter
            const start = new Date(filterStartDate).setHours(0, 0, 0, 0);
            currentFilteredPurchases = currentFilteredPurchases.filter(purchase => {
                const purchaseDate = new Date(purchase.date).getTime();
                return purchaseDate >= start;
            });
        } else if (!filterStartDate && filterEndDate) { // Only end date filter
            const end = new Date(filterEndDate).setHours(23, 59, 59, 999);
            currentFilteredPurchases = currentFilteredPurchases.filter(purchase => {
                const purchaseDate = new Date(purchase.date).getTime();
                return purchaseDate <= end;
            });
        }

        // Filter by search term
        if (searchTerm) {
            currentFilteredPurchases = currentFilteredPurchases.filter(purchase =>
                purchase.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredPurchases(currentFilteredPurchases);
        setCurrentPage(1); // Reset to first page when filters/search change
    }, [allPurchases, filterStatus, searchTerm, filterStartDate, filterEndDate]);

    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return; // Prevent going out of bounds
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 min-h-screen bg-gray-100 text-gray-900"
        >
            <h1 className="text-4xl font-bold mb-8 text-blue-600">Purchase History</h1>

            {/* Filter and Search Section */}
            <section className="mb-8 bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Filter Purchase History</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                    {/* Search Bar */}
                    <div className="relative col-span-full md:col-span-1">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search item or supplier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Filter by Status */}
                    <div>
                        <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            id="filter-status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as 'All' | 'pending_payment' | 'paid')}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="paid">Paid</option>
                            <option value="pending_payment">Pending Payment</option>
                        </select>
                    </div>

                    {/* Filter by Date Range */}
                    <div>
                        <label htmlFor="filter-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="filter-start-date"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="filter-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="filter-end-date"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </section>

            {/* Purchase History Table */}
            <section className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Supplier
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.length > 0 ? (
                            currentItems.map((purchase) => (
                                <tr key={purchase.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {purchase.item}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {purchase.supplier}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {formatDate(purchase.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-700">
                                        {formatCurrency(purchase.totalAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                                            {purchase.status === 'paid' ? 'Paid' : 'Pending Payment'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No purchase history records found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {/* Pagination Controls */}
            {filteredPurchases.length > 0 && (
                <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-md">
                    <div className="flex items-center gap-2">
                        <label htmlFor="items-per-page" className="text-sm text-gray-700">Items per page:</label>
                        <select
                            id="items-per-page"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="p-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>

                    <nav className="flex items-center space-x-2" aria-label="Pagination">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous Page"
                        >
                            <FaChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => paginate(index + 1)}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    currentPage === index + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } transition-colors`}
                                aria-current={currentPage === index + 1 ? 'page' : undefined}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next Page"
                        >
                            <FaChevronRight className="w-4 h-4" />
                        </button>
                    </nav>
                </div>
            )}
        </motion.div>
    );
};

export default PurchaseHistoryPage;
