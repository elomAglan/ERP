import React, { useState, useEffect } from 'react';
import {  FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Added FaChevronLeft, FaChevronRight for pagination
import { motion } from 'framer-motion';

// --- Interfaces ---
interface Sale {
    id: number;
    item: string;
    customer: string;
    date: string; // ISO string format
    amount: number;
    status: "pending_payment" | "paid";
    warehouse: string;
}

// --- Mock Data for Sales ---
const mockSales: Sale[] = [
    { id: 201, item: 'Accounting Software License', customer: 'Client Alpha', date: '2025-08-24', amount: 400000, status: 'paid', warehouse: 'Main Warehouse' },
    { id: 202, item: 'IT Consultation Hours', customer: 'Client Beta', date: '2025-08-23', amount: 150000, status: 'pending_payment', warehouse: 'Remote Office Stock' },
    { id: 203, item: 'Application Development Kit', customer: 'Client Gamma', date: '2025-08-22', amount: 2500000, status: 'paid', warehouse: 'Main Warehouse' },
    { id: 204, item: 'Server Maintenance Contract', customer: 'Client Delta', date: '2025-08-20', amount: 80000, status: 'paid', warehouse: 'Cloud Services' },
    { id: 205, item: 'User Training Manuals', customer: 'Client Epsilon', date: '2025-08-19', amount: 120000, status: 'pending_payment', warehouse: 'Digital Assets' },
    { id: 206, item: 'Software Upgrade', customer: 'Client Zeta', date: '2025-08-15', amount: 500000, status: 'paid', warehouse: 'Main Warehouse' },
    { id: 207, item: 'Hardware Installation', customer: 'Client Eta', date: '2025-08-14', amount: 300000, status: 'pending_payment', warehouse: 'Physical Stock' },
    { id: 208, item: 'Cloud Storage Service', customer: 'Client Theta', date: '2025-08-13', amount: 75000, status: 'paid', warehouse: 'Cloud Services' },
    { id: 209, item: 'Network Setup', customer: 'Client Iota', date: '2025-08-12', amount: 450000, status: 'pending_payment', warehouse: 'Remote Office Stock' },
    { id: 210, item: 'Website Redesign', customer: 'Client Kappa', date: '2025-08-10', amount: 1200000, status: 'paid', warehouse: 'Digital Assets' },
    { id: 211, item: 'Cybersecurity Audit', customer: 'Client Lambda', date: '2025-08-09', amount: 600000, status: 'paid', warehouse: 'Cloud Services' },
    { id: 212, item: 'Database Migration', customer: 'Client Mu', date: '2025-08-08', amount: 900000, status: 'pending_payment', warehouse: 'Main Warehouse' },
    { id: 213, item: 'Mobile App Development', customer: 'Client Nu', date: '2025-08-05', amount: 3000000, status: 'paid', warehouse: 'Digital Assets' },
    { id: 214, item: 'Printer Repair', customer: 'Client Xi', date: '2025-08-04', amount: 40000, status: 'paid', warehouse: 'Physical Stock' },
    { id: 215, item: 'ERP Integration', customer: 'Client Omicron', date: '2025-08-01', amount: 4000000, status: 'pending_payment', warehouse: 'Main Warehouse' },
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
        case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
        case 'paid': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const SalesHistoryPage: React.FC = () => {
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'pending_payment' | 'paid'>('All');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // Default items per page

    useEffect(() => {
        // Sort sales by date, most recent first
        const sortedSales = [...mockSales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllSales(sortedSales);
        setFilteredSales(sortedSales); // Initially, show all sales history
        setCurrentPage(1); // Reset to first page on data load
    }, []);

    // Apply filters and search
    useEffect(() => {
        let currentFilteredSales = allSales;

        // Filter by status
        if (filterStatus !== 'All') {
            currentFilteredSales = currentFilteredSales.filter(sale => sale.status === filterStatus);
        }

        // Filter by date range
        if (filterStartDate && filterEndDate) {
            const start = new Date(filterStartDate).setHours(0, 0, 0, 0);
            const end = new Date(filterEndDate).setHours(23, 59, 59, 999);
            currentFilteredSales = currentFilteredSales.filter(sale => {
                const saleDate = new Date(sale.date).getTime();
                return saleDate >= start && saleDate <= end;
            });
        } else if (filterStartDate && !filterEndDate) { // Only start date filter
            const start = new Date(filterStartDate).setHours(0, 0, 0, 0);
            currentFilteredSales = currentFilteredSales.filter(sale => {
                const saleDate = new Date(sale.date).getTime();
                return saleDate >= start;
            });
        } else if (!filterStartDate && filterEndDate) { // Only end date filter
            const end = new Date(filterEndDate).setHours(23, 59, 59, 999);
            currentFilteredSales = currentFilteredSales.filter(record => { // Corrected from currentFilteredHistory
                const recordDate = new Date(record.date).getTime();
                return recordDate <= end;
            });
        }


        // Filter by search term
        if (searchTerm) {
            currentFilteredSales = currentFilteredSales.filter(sale =>
                sale.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredSales(currentFilteredSales);
        setCurrentPage(1); // Reset to first page when filters/search change
    }, [allSales, filterStatus, searchTerm, filterStartDate, filterEndDate]);

    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

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
            <h1 className="text-4xl font-bold mb-8 text-blue-600">Sales History</h1>

            {/* Filter and Search Section */}
            <section className="mb-8 bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Filter Sales History</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                    {/* Search Bar */}
                    <div className="relative col-span-full md:col-span-1">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search item, customer, or warehouse..."
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

            {/* Sales History Table */}
            <section className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Warehouse
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
                        {currentItems.length > 0 ? ( // Use currentItems for rendering
                            currentItems.map((sale) => (
                                <tr key={sale.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {sale.item}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {sale.customer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {sale.warehouse}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {formatDate(sale.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-700">
                                        {formatCurrency(sale.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                                            {sale.status === 'paid' ? 'Paid' : 'Pending Payment'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No sales history records found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {/* Pagination Controls */}
            {filteredSales.length > 0 && (
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

export default SalesHistoryPage;
