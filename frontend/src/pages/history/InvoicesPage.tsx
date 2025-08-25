import React, { useState, useEffect } from 'react';
import { FaFileInvoice, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- Interfaces ---
interface Invoice {
    id: string; // Unique invoice ID
    type: 'Sale' | 'Purchase'; // Invoice type
    refNumber: string; // Reference number (e.g., SO-001, PO-001)
    partner: string; // Customer or Supplier name
    issueDate: string; // Date invoice was issued (ISO string format)
    dueDate: string; // Date payment is due (ISO string format)
    totalAmount: number;
    status: "pending" | "paid" | "overdue"; // Payment status of the invoice
    notes?: string;
}

// --- Mock Data for Invoices ---
const mockInvoices: Invoice[] = [
    { id: 'INV-S-001', type: 'Sale', refNumber: 'SO-001', partner: 'Client Alpha', issueDate: '2025-08-20', dueDate: '2025-09-20', totalAmount: 400000, status: 'paid' },
    { id: 'INV-P-001', type: 'Purchase', refNumber: 'PO-001', partner: 'Tech Solutions', issueDate: '2025-08-18', dueDate: '2025-09-18', totalAmount: 1800000, status: 'pending' },
    { id: 'INV-S-002', type: 'Sale', refNumber: 'SO-002', partner: 'Client Beta', issueDate: '2025-08-15', dueDate: '2025-09-15', totalAmount: 150000, status: 'overdue', notes: 'Reminder sent' },
    { id: 'INV-P-002', type: 'Purchase', refNumber: 'PO-002', partner: 'Office Depot', issueDate: '2025-08-14', dueDate: '2025-09-14', totalAmount: 600000, status: 'paid' },
    { id: 'INV-S-003', type: 'Sale', refNumber: 'SO-003', partner: 'Client Gamma', issueDate: '2025-08-10', dueDate: '2025-09-10', totalAmount: 2500000, status: 'paid' },
    { id: 'INV-P-003', type: 'Purchase', refNumber: 'PO-003', partner: 'Software Hub', issueDate: '2025-08-08', dueDate: '2025-09-08', totalAmount: 1500000, status: 'pending' },
    { id: 'INV-S-004', type: 'Sale', refNumber: 'SO-004', partner: 'Client Delta', issueDate: '2025-08-05', dueDate: '2025-09-05', totalAmount: 80000, status: 'paid' },
    { id: 'INV-P-004', type: 'Purchase', refNumber: 'PO-004', partner: 'AWS Reseller', issueDate: '2025-08-03', dueDate: '2025-09-03', totalAmount: 300000, status: 'overdue' },
    { id: 'INV-S-005', type: 'Sale', refNumber: 'SO-005', partner: 'Client Epsilon', issueDate: '2025-07-28', dueDate: '2025-08-28', totalAmount: 120000, status: 'paid' },
    { id: 'INV-P-005', type: 'Purchase', refNumber: 'PO-005', partner: 'Global Advisors', issueDate: '2025-07-25', dueDate: '2025-08-25', totalAmount: 750000, status: 'paid' },
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
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'paid': return 'bg-green-100 text-green-800';
        case 'overdue': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const InvoicesPage: React.FC = () => {
    const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'pending' | 'paid' | 'overdue'>('All');
    const [filterType, setFilterType] = useState<'All' | 'Sale' | 'Purchase'>('All');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // Default items per page

    useEffect(() => {
        // Sort invoices by issue date, most recent first
        const sortedInvoices = [...mockInvoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
        setAllInvoices(sortedInvoices);
        setFilteredInvoices(sortedInvoices); // Initially, show all invoices
        setCurrentPage(1); // Reset to first page on data load
    }, []);

    // Extract unique partners for filter dropdowns
    // (Removed unused uniquePartners variable)


    // Apply filters and search
    useEffect(() => {
        let currentFilteredInvoices = allInvoices;

        // Filter by invoice type
        if (filterType !== 'All') {
            currentFilteredInvoices = currentFilteredInvoices.filter(invoice => invoice.type === filterType);
        }

        // Filter by status
        if (filterStatus !== 'All') {
            currentFilteredInvoices = currentFilteredInvoices.filter(invoice => invoice.status === filterStatus);
        }

        // Filter by date range (issueDate)
        if (filterStartDate && filterEndDate) {
            const start = new Date(filterStartDate).setHours(0, 0, 0, 0);
            const end = new Date(filterEndDate).setHours(23, 59, 59, 999);
            currentFilteredInvoices = currentFilteredInvoices.filter(invoice => {
                const invoiceDate = new Date(invoice.issueDate).getTime();
                return invoiceDate >= start && invoiceDate <= end;
            });
        } else if (filterStartDate && !filterEndDate) { // Only start date filter
            const start = new Date(filterStartDate).setHours(0, 0, 0, 0);
            currentFilteredInvoices = currentFilteredInvoices.filter(invoice => {
                const invoiceDate = new Date(invoice.issueDate).getTime();
                return invoiceDate >= start;
            });
        } else if (!filterStartDate && filterEndDate) { // Only end date filter
            const end = new Date(filterEndDate).setHours(23, 59, 59, 999);
            currentFilteredInvoices = currentFilteredInvoices.filter(invoice => {
                const invoiceDate = new Date(invoice.issueDate).getTime();
                return invoiceDate <= end;
            });
        }

        // Filter by search term
        if (searchTerm) {
            currentFilteredInvoices = currentFilteredInvoices.filter(invoice =>
                invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.partner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (invoice.notes && invoice.notes.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredInvoices(currentFilteredInvoices);
        setCurrentPage(1); // Reset to first page when filters/search change
    }, [allInvoices, filterType, filterStatus, searchTerm, filterStartDate, filterEndDate]);

    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

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
            <h1 className="text-4xl font-bold mb-8 text-blue-600 flex items-center gap-3">
                <FaFileInvoice className="w-8 h-8" /> Invoice History
            </h1>

            {/* Filter and Search Section */}
            <section className="mb-8 bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Filter Invoices History</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                    {/* Search Bar */}
                    <div className="relative col-span-full md:col-span-1">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search ID, ref number, partner or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Filter by Type */}
                    <div>
                        <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            id="filter-type"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as 'All' | 'Sale' | 'Purchase')}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="Sale">Sale</option>
                            <option value="Purchase">Purchase</option>
                        </select>
                    </div>

                    {/* Filter by Status */}
                    <div>
                        <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            id="filter-status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as 'All' | 'pending' | 'paid' | 'overdue')}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>

                    {/* Filter by Date Range (Issue Date) */}
                    <div>
                        <label htmlFor="filter-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date (Issue)
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
                            End Date (Issue)
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

            {/* Invoices History Table */}
            <section className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ref. Number
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Partner
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Issue Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Due Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.length > 0 ? (
                            currentItems.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {invoice.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {invoice.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {invoice.refNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {invoice.partner}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {formatDate(invoice.issueDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {formatDate(invoice.dueDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-700">
                                        {formatCurrency(invoice.totalAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                    No invoice records found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {/* Pagination Controls */}
            {filteredInvoices.length > 0 && (
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

export default InvoicesPage;
