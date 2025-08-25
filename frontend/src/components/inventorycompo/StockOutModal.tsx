// In src/components/inventorycompo/StockOutModal.tsx

import React, { useState, useEffect } from 'react';
import { FaMinus, FaTags } from 'react-icons/fa';

// Interfaces for sales data (to be imported if they are in a shared file)
interface Item {
    id: number;
    name: string;
    category: string;
    stock: number;
    unit_price: number;
    last_updated: string;
}

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

// Interface for the stock-out modal properties
interface StockOutModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onAdjustStock must be able to handle multiple updates
    onAdjustStock: (itemId: number, newStock: number) => void;
    inventory: Item[];
    sales: Sale[]; // NEW: we're adding the list of sales
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const StockOutModal: React.FC<StockOutModalProps> = ({ isOpen, onClose, onAdjustStock, inventory, sales }) => {
    const [selectedSaleId, setSelectedSaleId] = useState<number | ''>('');
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    // Resets the state each time the modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedSaleId('');
            setSelectedSale(null);
        }
    }, [isOpen]);

    // Updates the selected sale when the ID changes
    useEffect(() => {
        if (selectedSaleId !== '') {
            const sale = sales.find(s => s.id === selectedSaleId);
            setSelectedSale(sale || null);
        } else {
            setSelectedSale(null);
        }
    }, [selectedSaleId, sales]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSale) {
            alert("Please select a sale to process.");
            return;
        }

        // Checks the stock for each item in the sale
        for (const saleLine of selectedSale.items) {
            const inventoryItem = inventory.find(item => item.id === saleLine.itemId);
            if (!inventoryItem) {
                alert(`Error: Item ID ${saleLine.itemId} from this sale was not found in inventory.`);
                return;
            }
            if (inventoryItem.stock < saleLine.quantity) {
                alert(`Insufficient stock for item "${inventoryItem.name}". Current stock: ${inventoryItem.stock}, Quantity sold: ${saleLine.quantity}.`);
                return;
            }
        }
        
        const confirmationMessage = `Are you sure you want to record the stock out for sale #${selectedSale.id}?`;

        if (window.confirm(confirmationMessage)) {
            // Updates the stock for each item in the sale
            selectedSale.items.forEach(saleLine => {
                const inventoryItem = inventory.find(item => item.id === saleLine.itemId);
                if (inventoryItem) {
                    const newStock = inventoryItem.stock - saleLine.quantity;
                    onAdjustStock(inventoryItem.id, newStock);
                }
            });
            onClose();
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* CORRECTION: Increased the modal's max-width from max-w-sm to max-w-lg */}
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FaMinus /> Record a Stock Out
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="sale" className="block text-sm font-medium text-gray-700">Select a Sale</label>
                        <select
                            id="sale"
                            value={selectedSaleId}
                            onChange={(e) => setSelectedSaleId(Number(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                            required
                        >
                            <option value="">Choose a sale...</option>
                            {sales.map(sale => (
                                <option key={sale.id} value={sale.id}>
                                    Sale #{sale.id} - {sale.customer} - {formatCurrency(sale.totalAmount)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedSale && (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                            <h4 className="flex items-center gap-2 text-md font-semibold text-gray-800">
                                <FaTags /> Sale Details
                            </h4>
                            {selectedSale.items.map((line, index) => {
                                const inventoryItem = inventory.find(item => item.id === line.itemId);
                                if (!inventoryItem) return null;

                                return (
                                    <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                                        <p className="text-sm font-medium text-gray-900">{inventoryItem.name}</p>
                                        <p className="text-sm text-gray-600">
                                            Quantity: {line.quantity} | Value: {formatCurrency(line.quantity * inventoryItem.unit_price)}
                                        </p>
                                    </div>
                                );
                            })}
                            <p className="text-right text-lg font-bold text-gray-800">
                                Total: {formatCurrency(selectedSale.totalAmount)}
                            </p>
                        </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            disabled={!selectedSale}
                        >
                            Confirm Stock Out
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockOutModal;