import React, { useState } from 'react';
import { FaPlus, FaTrash, FaSearch, FaFilter, FaFileDownload, FaCheckCircle, FaFileInvoiceDollar, FaWarehouse } from "react-icons/fa";

// Import modals (assuming these are already in English or will be translated separately)
import AddSaleModal from "../../components/salescompo/AddSaleModal";
import SaleDetailModal from "../../components/salescompo/SaleDetailModal";
import FilterSaleModal from "../../components/salescompo/FilterSaleModal";

// Interface for a sale
interface Sale {
    id: number;
    item: string;
    customer: string;
    date: string;
    amount: number;
    document: string | null;
    status: "pending_payment" | "paid";
    warehouse: string; // New: Warehouse property
}

// Sample sales data with added warehouse information
const initialSales: Sale[] = [
    { id: 1, item: 'Accounting Software License', customer: 'Company A', date: '2025-08-22', amount: 350000, document: 'customer-invoice-001.pdf', status: 'paid', warehouse: 'Main Warehouse' },
    { id: 2, item: 'IT Consultation', customer: 'Startup B', date: '2025-08-21', amount: 150000, document: null, status: 'pending_payment', warehouse: 'Remote Office Stock' },
    { id: 3, item: 'Application Development', customer: 'Corporation C', date: '2025-08-19', amount: 2500000, document: 'dev-contract-002.pdf', status: 'pending_payment', warehouse: 'Main Warehouse' },
    { id: 4, item: 'Server Maintenance', customer: 'Tech Solutions', date: '2025-08-18', amount: 80000, document: 'service-contract-003.pdf', status: 'paid', warehouse: 'Cloud Services' },
    { id: 5, item: 'User Training', customer: 'Global Inc.', date: '2025-08-17', amount: 120000, document: null, status: 'paid', warehouse: 'Digital Assets' },
];

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'long', year: 'numeric' }).format(
        new Date(date)
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

const SalesPage: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>(initialSales);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSales, setSelectedSales] = useState<number[]>([]);
    const [selectedSaleToDetail, setSelectedSaleToDetail] = useState<Sale | null>(null);
    const [activeFilters, setActiveFilters] = useState({
        paid: false,
        pending: false,
        noDocument: false,
    });

    // Total sales amount calculation
    const total = sales.reduce((sum, s) => sum + s.amount, 0);

    const filteredSales = sales.filter(sale => {
        const matchesSearchTerm =
            sale.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.warehouse.toLowerCase().includes(searchTerm.toLowerCase()); // New: Search by warehouse

        const matchesStatus =
            (!activeFilters.paid && !activeFilters.pending) || // No status filter applied OR
            (activeFilters.paid && sale.status === 'paid') || // Filter by paid
            (activeFilters.pending && sale.status === 'pending_payment'); // Filter by pending

        const matchesDocument =
            !activeFilters.noDocument || // No document filter applied OR
            (activeFilters.noDocument && sale.document === null); // Filter by no document

        return matchesSearchTerm && matchesStatus && matchesDocument;
    });

    const selectedPendingSales = sales.filter(s => selectedSales.includes(s.id) && s.status === 'pending_payment');
    const selectedPaidSales = sales.filter(s => selectedSales.includes(s.id) && s.status === 'paid');

    const handleAddSale = (newSale: Omit<Sale, 'id' | 'status'>) => {
        const newSaleWithId: Sale = {
            ...newSale,
            id: Math.max(...sales.map(s => s.id), 0) + 1,
            status: 'pending_payment', // Default status for new sales
        };
        setSales([newSaleWithId, ...sales]);
    };

    const handleMarkAsPaid = () => {
        if (selectedPendingSales.length === 0) {
            alert("Please select at least one pending payment sale.");
            return;
        }

        setSales(sales.map(s => {
            if (selectedPendingSales.find(p => p.id === s.id)) {
                return { ...s, status: 'paid' };
            }
            return s;
        }));
        setSelectedSales([]);
    };

    const handleGenerateReceipt = () => {
        if (selectedPaidSales.length !== 1) {
            alert("Please select exactly one paid sale to generate the receipt.");
            return;
        }
        const sale = selectedPaidSales[0];
        alert(`Generating receipt for sale #${sale.id}: ${sale.item} for ${formatCurrency(sale.amount)}.`);
    };

    const handleViewDetail = () => {
        if (selectedSales.length === 1) {
            const selected = sales.find(s => s.id === selectedSales[0]);
            if (selected) {
                setSelectedSaleToDetail(selected);
                setIsDetailModalOpen(true);
            }
        } else {
            alert("Please select only one sale to view details.");
        }
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedSales(checked ? filteredSales.map(s => s.id) : []);
    };

    const handleSelectSale = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedSales([...selectedSales, id]);
        } else {
            setSelectedSales(selectedSales.filter(sId => sId !== id));
        }
    };
    
    const handleDeleteSelected = () => {
        if (selectedSales.length === 0) {
            alert("Please select at least one sale to delete.");
            return;
        }
        if (window.confirm("Are you sure you want to delete the selected sales?")) {
            setSales(sales.filter(s => !selectedSales.includes(s.id)));
            setSelectedSales([]);
        }
    };
    
    const isAllSelected = filteredSales.length > 0 && 
        selectedSales.length === filteredSales.length;

    const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

    return (
        <div className="p-6 bg-gray-50 rounded-2xl shadow-lg min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Sales Management</h2>
                    <p className="text-gray-600 mt-1">
                        Manage and track company sales.
                    </p>
                </div>
                
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FaPlus className="w-4 h-4" />
                    New Sale
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search item, customer or warehouse..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <button 
                    onClick={() => setIsFilterModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
                >
                    <FaFilter className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>
            
            <div className="h-12 flex justify-end items-center mb-2 gap-2">
                {selectedSales.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleViewDetail}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                        >
                            <FaFileDownload className="w-3 h-3" />
                            View Details
                        </button>
                        
                        {selectedPendingSales.length > 0 && (
                            <button
                                onClick={handleMarkAsPaid}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                                <FaCheckCircle className="w-3 h-3" />
                                Mark as Paid
                            </button>
                        )}

                        {selectedPaidSales.length === 1 && (
                            <button
                                onClick={handleGenerateReceipt}
                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                            >
                                <FaFileInvoiceDollar className="w-3 h-3" />
                                Generate Receipt
                            </button>
                        )}

                        <button
                            onClick={handleDeleteSelected}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                        >
                            <FaTrash className="w-3 h-3" />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-6 text-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th> {/* New: Warehouse Header */}
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredSales.length > 0 ? (
                            filteredSales.map((sale) => (
                                <tr 
                                    key={sale.id} 
                                    className={`hover:bg-gray-50 transition-colors ${
                                        selectedSales.includes(sale.id) ? 'bg-green-50' : ''
                                    }`}
                                >
                                    <td className="py-4 px-6 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedSales.includes(sale.id)}
                                            onChange={(e) => handleSelectSale(sale.id, e.target.checked)}
                                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{sale.item}</td>
                                    <td className="py-4 px-6 text-sm text-gray-700">{sale.customer}</td>
                                    <td className="py-4 px-6 text-sm text-gray-700">{formatDate(sale.date)}</td>
                                    <td className="py-4 px-6 text-sm text-gray-700 flex items-center gap-1"> {/* New: Warehouse data */}
                                        <FaWarehouse className="w-3 h-3 text-gray-400" /> {sale.warehouse}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`}>
                                            {sale.status === 'pending_payment' && 'Pending Payment'}
                                            {sale.status === 'paid' && 'Paid'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-700 text-right font-mono">{formatCurrency(sale.amount)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-8 px-6 text-center text-gray-500">
                                    No sales found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                        <tr>
                            <td colSpan={6} className="py-4 px-6 text-right font-semibold text-gray-800">
                                Total:
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-700 text-right font-semibold font-mono">
                                {formatCurrency(total)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Modals */}
            <AddSaleModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddSale}
            />
            
            <SaleDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                sale={selectedSaleToDetail}
            />
            
            <FilterSaleModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
            />
        </div>
    );
};

export default SalesPage;
