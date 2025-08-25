import React, { useState } from 'react';
import { FaTrash, FaSearch, FaFilter, FaPlus, FaMinus, FaWarehouse } from "react-icons/fa";

// Importez les modales
import FilterInventoryModal from "../../components/inventorycompo/FilterInventoryModal";
import StockAdjustmentModal from "../../components/inventorycompo/StockAdjustmentModal";
import StockInModal from "../../components/inventorycompo/StockInModal";
import StockOutModal from "../../components/inventorycompo/StockOutModal";

// --- NOUVELLES INTERFACES POUR LES VENTES ET ACHATS ---
interface SaleLine {
    itemId: number;
    quantity: number;
    unitPrice: number;
}

interface Sale {
    id: number;
    saleDate: string;
    customer: string;
    totalAmount: number;
    items: SaleLine[];
}

interface PurchaseItem {
    itemId: number;
    quantity: number;
}

interface Purchase {
    id: number;
    purchaseDate: string;
    supplier: string;
    items: PurchaseItem[];
}
// --- FIN DES NOUVELLES INTERFACES ---

// Interface pour un article d'inventaire
interface Item {
    id: number;
    name: string;
    category: string;
    stock: number;
    unit_price: number;
    last_updated: string;
}

// Données d'inventaire factices
const initialInventory: Item[] = [
    { id: 1, name: 'Accounting Software License', category: 'Software', stock: 50, unit_price: 350000, last_updated: '2025-08-20' },
    { id: 2, name: 'IT Consultation Hours', category: 'Service', stock: 100, unit_price: 150000, last_updated: '2025-08-18' },
    { id: 3, name: 'Application Development Kit', category: 'Software', stock: 15, unit_price: 2500000, last_updated: '2025-08-22' },
    { id: 4, name: 'Server Maintenance Contract', category: 'Service', stock: 5, unit_price: 80000, last_updated: '2025-08-21' },
    { id: 5, name: 'User Training Manuals', category: 'Document', stock: 300, unit_price: 120000, last_updated: '2025-08-15' },
];

// --- DONNÉES DE VENTES FACTICES ---
const initialSales: Sale[] = [
    {
        id: 201, saleDate: '2025-08-26', customer: 'Client A', totalAmount: 400000,
        items: [{ itemId: 1, quantity: 1, unitPrice: 350000 }, { itemId: 2, quantity: 1, unitPrice: 50000 }]
    },
    {
        id: 202, saleDate: '2025-08-25', customer: 'Client B', totalAmount: 1000000,
        items: [{ itemId: 3, quantity: 1, unitPrice: 1000000 }]
    },
    {
        id: 203, saleDate: '2025-08-24', customer: 'Client C', totalAmount: 360000,
        items: [{ itemId: 5, quantity: 3, unitPrice: 120000 }]
    }
];

// --- DONNÉES D'ACHAT FACTICES (corrigées) ---
const initialPurchases: Purchase[] = [
    { id: 101, purchaseDate: '2025-08-25', supplier: 'Tech Solutions', items: [{ itemId: 1, quantity: 10 }, { itemId: 3, quantity: 5 }] },
    { id: 102, purchaseDate: '2025-08-24', supplier: 'Office Depot', items: [{ itemId: 5, quantity: 50 }] },
    { id: 103, purchaseDate: '2025-08-23', supplier: 'Consulting Group', items: [{ itemId: 2, quantity: 20 }] },
];
// --- FIN DES DONNÉES D'ACHAT FACTICES ---

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);

const getStockColor = (stock: number) => {
    if (stock < 10) return 'bg-red-100 text-red-800';
    if (stock < 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
};

const InventoryPage: React.FC = () => {
    const [inventory, setInventory] = useState<Item[]>(initialInventory);
    const [sales] = useState<Sale[]>(initialSales);
    
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
    const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
    
    const [selectedItemToAdjust, setSelectedItemToAdjust] = useState<Item | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [activeFilters, setActiveFilters] = useState({
        lowStock: false,
        category: 'all',
    });

    const filteredItems = inventory.filter(item => {
        const matchesSearchTerm =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilters =
            (!activeFilters.lowStock || item.stock < 10) &&
            (activeFilters.category === 'all' || activeFilters.category === item.category);

        return matchesSearchTerm && matchesFilters;
    });

    const totalStockValue = filteredItems.reduce((sum, item) => sum + (item.stock * item.unit_price), 0);
    const isAllSelected = filteredItems.length > 0 && selectedItems.length === filteredItems.length;

    const handleDeleteSelected = () => {
        if (selectedItems.length === 0) {
            alert("Please select at least one item to delete.");
            return;
        }
        if (window.confirm("Are you sure you want to delete the selected items?")) {
            setInventory(inventory.filter(item => !selectedItems.includes(item.id)));
            setSelectedItems([]);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedItems(checked ? filteredItems.map(item => item.id) : []);
    };

    const handleSelectItem = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedItems([...selectedItems, id]);
        } else {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        }
    };
    
    // Fonction d'ajustement universelle
    const handleAdjustStock = (itemId: number, newStock: number) => {
        setInventory(prevInventory => 
            prevInventory.map(item => 
                item.id === itemId ? { ...item, stock: newStock, last_updated: new Date().toISOString().split('T')[0] } : item
            )
        );
    };

    const handleOpenAdjustModal = () => {
        if (selectedItems.length !== 1) {
            alert("Please select exactly one item to adjust stock.");
            return;
        }
        const selectedItem = inventory.find(item => item.id === selectedItems[0]);
        if (selectedItem) {
            setSelectedItemToAdjust(selectedItem);
            setIsAdjustModalOpen(true);
        }
    };

    const activeFilterCount = (activeFilters.lowStock ? 1 : 0) + (activeFilters.category !== 'all' ? 1 : 0);
    const categories = Array.from(new Set(initialInventory.map(item => item.category)));

    return (
        <div className="p-6 bg-gray-50 rounded-2xl shadow-lg min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Inventory Management</h2>
                    <p className="text-gray-600 mt-1">
                        Track and manage your company's stock.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsStockInModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <FaPlus className="w-4 h-4" />
                        Stock In
                    </button>
                    <button
                        onClick={() => setIsStockOutModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <FaMinus className="w-4 h-4" />
                        Stock Out
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or category..."
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
                {selectedItems.length > 0 && (
                    <div className="flex gap-2">
                        {selectedItems.length === 1 && (
                            <button
                                onClick={handleOpenAdjustModal}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                                <FaWarehouse className="w-3 h-3" />
                                Adjust Stock
                            </button>
                        )}
                        <button
                            onClick={handleDeleteSelected}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                        >
                            <FaTrash className="w-3 h-3" />
                            Delete ({selectedItems.length})
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
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <tr 
                                    key={item.id} 
                                    className={`hover:bg-gray-50 transition-colors ${
                                        selectedItems.includes(item.id) ? 'bg-green-50' : ''
                                    }`}
                                >
                                    <td className="py-4 px-6 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{item.name}</td>
                                    <td className="py-4 px-6 text-sm text-gray-700">{item.category}</td>
                                    <td className="py-4 px-6 text-sm">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStockColor(item.stock)}`}>
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-700 text-right font-mono">{formatCurrency(item.unit_price)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">
                                    No items found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                        <tr>
                            <td colSpan={3} className="py-4 px-6 text-right font-semibold text-gray-800">
                                Total Items:
                            </td>
                            <td className="py-4 px-6 text-right font-semibold text-gray-800">
                                {filteredItems.length}
                            </td>
                            <td className="py-4 px-6 text-right font-semibold text-gray-800 font-mono">
                                {formatCurrency(totalStockValue)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Modales pour le filtre et la gestion des stocks */}
            <FilterInventoryModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
                categories={categories}
            />

            <StockAdjustmentModal
                isOpen={isAdjustModalOpen}
                onClose={() => setIsAdjustModalOpen(false)}
                onAdjustStock={handleAdjustStock}
                item={selectedItemToAdjust}
            />

            <StockInModal
                isOpen={isStockInModalOpen}
                onClose={() => setIsStockInModalOpen(false)}
                onAdjustStock={handleAdjustStock}
                inventory={inventory}
                purchases={initialPurchases}
            />
            
            <StockOutModal
                isOpen={isStockOutModalOpen}
                onClose={() => setIsStockOutModalOpen(false)}
                onAdjustStock={handleAdjustStock}
                inventory={inventory}
                sales={sales}
            />
        </div>
    );
};

export default InventoryPage;