// In src/components/inventorycompo/StockInModal.tsx

import React, { useState, useEffect } from "react";
import { FaPlus, FaCheck, FaTimes } from "react-icons/fa";

// --- INTERFACES FOR PURCHASE ---
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
// --- END OF INTERFACES ---

// Interface for an inventory item
interface Item {
    id: number;
    name: string;
    category: string;
    stock: number;
    unit_price: number;
    last_updated: string;
}

// Interface for modal props
interface StockInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdjustStock: (itemId: number, newStock: number) => void;
    purchases: Purchase[]; // The list of available purchases
    inventory: Item[]; // The full inventory list to find item names
}

const StockInModal: React.FC<StockInModalProps> = ({ isOpen, onClose, onAdjustStock, purchases, inventory }) => {
    const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | ''>('');
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

    // Resets the purchase selection on each open
    useEffect(() => {
        if (isOpen) {
            setSelectedPurchaseId('');
            setSelectedPurchase(null);
        }
    }, [isOpen]);

    // Updates the selected purchase when the ID changes
    useEffect(() => {
        if (selectedPurchaseId) {
            const purchase = purchases.find(p => p.id === selectedPurchaseId);
            setSelectedPurchase(purchase || null);
        } else {
            setSelectedPurchase(null);
        }
    }, [selectedPurchaseId, purchases]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPurchase) {
            alert("Please select a purchase order.");
            return;
        }

        const confirmationMessage = `Are you sure you want to confirm the stock-in for the purchase from ${selectedPurchase.purchaseDate} (${selectedPurchase.supplier})?\n\nItems concerned:\n` +
            selectedPurchase.items.map(pItem => {
                const invItem = inventory.find(inv => inv.id === pItem.itemId);
                return `- ${invItem?.name || 'Unknown item'} : ${pItem.quantity} unit(s)`;
            }).join('\n');

        if (window.confirm(confirmationMessage)) {
            // Loop through each item in the purchase to update the stock
            selectedPurchase.items.forEach(pItem => {
                const invItem = inventory.find(inv => inv.id === pItem.itemId);
                if (invItem) {
                    const newStock = invItem.stock + pItem.quantity;
                    onAdjustStock(invItem.id, newStock);
                }
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* The modal size has been increased from 'max-w-sm' to 'max-w-xl' for more space */}
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-full overflow-y-auto p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FaPlus /> New Stock In
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="purchase" className="block text-sm font-medium text-gray-700">Select a Purchase Order</label>
                        <select
                            id="purchase"
                            value={selectedPurchaseId}
                            onChange={(e) => setSelectedPurchaseId(Number(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                            required
                        >
                            <option value="">Select a purchase...</option>
                            {purchases.map(purchase => (
                                <option key={purchase.id} value={purchase.id}>
                                    Purchase #{purchase.id} - {purchase.supplier} ({purchase.purchaseDate})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedPurchase && (
                        <div className="p-4 bg-gray-100 rounded-lg">
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Purchase Details:</h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                                {selectedPurchase.items.map((pItem, index) => {
                                    const invItem = inventory.find(inv => inv.id === pItem.itemId);
                                    return (
                                        <li key={index} className="flex justify-between items-center">
                                            <span>- {invItem?.name || 'Unknown item'}</span>
                                            <span className="font-semibold text-gray-800">{pItem.quantity} unit(s)</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaTimes /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaCheck /> Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockInModal;