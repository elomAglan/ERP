import React, { useState, useEffect } from 'react';
import {  FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- Interfaces ---
interface StockInMovement {
    id: number;
    item: string;
    quantity: number;
    unit: string; // e.g., 'units', 'boxes', 'liters'
    source: string; // e.g., 'Purchase Order #123', 'Production', 'Return'
    warehouse: string;
    date: string; // ISO string format
    notes?: string;
}

// --- Mock Data for Stock In Movements ---
const mockStockInMovements: StockInMovement[] = [
    { id: 301, item: 'Accounting Software License', quantity: 10, unit: 'licenses', source: 'Purchase Order #001', warehouse: 'Main Warehouse', date: '2025-08-25', notes: 'Software renewal' },
    { id: 302, item: 'IT Consultation Hours', quantity: 50, unit: 'hours', source: 'Service Acquisition', warehouse: 'Digital Assets', date: '2025-08-24' },
    { id: 303, item: 'Application Development Kit', quantity: 5, unit: 'kits', source: 'Production Batch A', warehouse: 'Main Warehouse', date: '2025-08-23', notes: 'New version released' },
    { id: 304, item: 'Server Hardware Unit', quantity: 2, unit: 'units', source: 'Purchase Order #002', warehouse: 'Server Room', date: '2025-08-22' },
    { id: 305, item: 'User Training Manuals', quantity: 100, unit: 'copies', source: 'Printing Service', warehouse: 'Office Stock', date: '2025-08-21' },
    { id: 306, item: 'Cloud Storage Tokens', quantity: 200, unit: 'tokens', source: 'Cloud Provider', warehouse: 'Digital Assets', date: '2025-08-20' },
    { id: 307, item: 'Networking Cables', quantity: 50, unit: 'meters', source: 'Purchase Order #003', warehouse: 'Server Room', date: '2025-08-19' },
    { id: 308, item: 'Office Chairs', quantity: 10, unit: 'units', source: 'Furniture Supplier', warehouse: 'Office Stock', date: '2025-08-18' },
    { id: 309, item: 'Graphic Design Software', quantity: 3, unit: 'licenses', source: 'Vendor Partnership', warehouse: 'Digital Assets', date: '2025-08-17' },
    { id: 310, item: 'External Hard Drives', quantity: 8, unit: 'units', source: 'Purchase Order #004', warehouse: 'Main Warehouse', date: '2025-08-16' },
];

// --- Utility Functions ---
const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'long', year: 'numeric' }).format(
        new Date(dateString)
    );

const StockInPage: React.FC = () => {
    const [allMovements, setAllMovements] = useState<StockInMovement[]>([]);
    const [filteredMovements, setFilteredMovements] = useState<StockInMovement[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterWarehouse, setFilterWarehouse] = useState<'All' | string>('All');
    const [filterItem, setFilterItem] = useState<'All' | string>('All');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // Default items per page

    useEffect(() => {
        // Sort movements by date, most recent first
        const sortedMovements = [...mockStockInMovements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllMovements(sortedMovements);
        setFilteredMovements(sortedMovements); // Initially, show all movements
        setCurrentPage(1); // Reset to first page on data load
    }, []);

    // Extract unique warehouses and items for filter dropdowns
    const uniqueWarehouses = ['All', ...new Set(allMovements.map(m => m.warehouse))];
    const uniqueItems = ['All', ...new Set(allMovements.map(m => m.item))];


    // Apply filters and search
    useEffect(() => {
        let currentFilteredMovements = allMovements;

        // Filter by warehouse
        if (filterWarehouse !== 'All') {
            currentFilteredMovements = currentFilteredMovements.filter(movement => movement.warehouse === filterWarehouse);
        }

        // Filter by item
        if (filterItem !== 'All') {
            currentFilteredMovements = currentFilteredMovements.filter(movement => movement.item === filterItem);
        }

        // Filter by date range
        if (filterStartDate && filterEndDate) {
            const start = new Date(filterStartDate).setHours(0, 0, 0, 0);
            const end = new Date(filterEndDate).setHours(23, 59, 59, 999);
            currentFilteredMovements = currentFilteredMovements.filter(movement => {
                const movementDate = new Date(movement.date).getTime();
                return movementDate >= start && movementDate <= end;
            });
        } else if (filterStartDate && !filterEndDate) { // Only start date filter
            const start = new Date(filterStartDate).setHours(0, 0, 0, 0);
            currentFilteredMovements = currentFilteredMovements.filter(movement => {
                const movementDate = new Date(movement.date).getTime();
                return movementDate >= start;
            });
        } else if (!filterStartDate && filterEndDate) { // Only end date filter
            const end = new Date(filterEndDate).setHours(23, 59, 59, 999);
            currentFilteredMovements = currentFilteredMovements.filter(movement => {
                const movementDate = new Date(movement.date).getTime();
                return movementDate <= end;
            });
        }

        // Filter by search term
        if (searchTerm) {
            currentFilteredMovements = currentFilteredMovements.filter(movement =>
                movement.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movement.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movement.warehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (movement.notes && movement.notes.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredMovements(currentFilteredMovements);
        setCurrentPage(1); // Reset to first page when filters/search change
    }, [allMovements, filterWarehouse, filterItem, searchTerm, filterStartDate, filterEndDate]);

    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMovements.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

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
            <h1 className="text-4xl font-bold mb-8 text-blue-600">Stock In Movements History</h1>

            {/* Filter and Search Section */}
            <section className="mb-8 bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Filter Stock In History</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                    {/* Search Bar */}
                    <div className="relative col-span-full md:col-span-1">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search item, source, warehouse or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Filter by Item */}
                    <div>
                        <label htmlFor="filter-item" className="block text-sm font-medium text-gray-700 mb-1">
                            Item
                        </label>
                        <select
                            id="filter-item"
                            value={filterItem}
                            onChange={(e) => setFilterItem(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {uniqueItems.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter by Warehouse */}
                    <div>
                        <label htmlFor="filter-warehouse" className="block text-sm font-medium text-gray-700 mb-1">
                            Warehouse
                        </label>
                        <select
                            id="filter-warehouse"
                            value={filterWarehouse}
                            onChange={(e) => setFilterWarehouse(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {uniqueWarehouses.map(warehouse => (
                                <option key={warehouse} value={warehouse}>{warehouse}</option>
                            ))}
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

            {/* Stock In Movements Table */}
            <section className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Unit
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Source
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Warehouse
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Notes
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.length > 0 ? (
                            currentItems.map((movement) => (
                                <tr key={movement.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {movement.item}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {movement.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {movement.unit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {movement.source}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {movement.warehouse}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {formatDate(movement.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {movement.notes || 'N/A'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No stock in movement records found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {/* Pagination Controls */}
            {filteredMovements.length > 0 && (
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

export default StockInPage;
