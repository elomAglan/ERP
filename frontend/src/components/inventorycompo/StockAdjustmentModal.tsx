import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

// Interface for an inventory item (same as in InventoryPage)
interface Item {
    id: number;
    name: string;
    category: string;
    stock: number;
    unit_price: number;
    last_updated: string;
}

// Interface for modal props
interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdjustStock: (itemId: number, newStock: number) => void;
    item: Item | null;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose, onAdjustStock, item }) => {
    const [transactionType, setTransactionType] = useState<'add' | 'remove'>('add');
    const [quantity, setQuantity] = useState<number | ''>(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!item || quantity === '') {
            return;
        }

        const currentStock = item.stock;
        const adjustment = transactionType === 'add' ? Number(quantity) : -Number(quantity);
        const newStock = currentStock + adjustment;

        // Validation pour éviter un stock négatif
        if (newStock < 0) {
            alert("Impossible de retirer plus d'articles qu'il n'y en a en stock.");
            return;
        }

        // Construction du message de confirmation
        const actionText = transactionType === 'add' ? "ajouter" : "retirer";
        const confirmationMessage = `Voulez-vous vraiment ${actionText} ${quantity} unité(s) pour l'article "${item.name}" ?`;

        // Affichage de la boîte de dialogue de confirmation
        if (window.confirm(confirmationMessage)) {
            onAdjustStock(item.id, newStock);
            setQuantity(1);
            onClose();
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Ajuster le stock de : {item.name}</h3>
                <div className="text-sm text-gray-500">
                    Stock actuel : <span className="font-semibold text-gray-800">{item.stock}</span>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-around items-center bg-gray-100 rounded-lg p-2">
                        <label 
                            className={`flex-1 text-center py-2 cursor-pointer rounded-lg transition-colors ${transactionType === 'add' ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                        >
                            <input
                                type="radio"
                                name="transactionType"
                                value="add"
                                checked={transactionType === 'add'}
                                onChange={() => setTransactionType('add')}
                                className="hidden"
                            />
                            <FaPlus className="inline mr-2" /> Ajouter
                        </label>
                        <label 
                            className={`flex-1 text-center py-2 cursor-pointer rounded-lg transition-colors ${transactionType === 'remove' ? 'bg-red-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                        >
                            <input
                                type="radio"
                                name="transactionType"
                                value="remove"
                                checked={transactionType === 'remove'}
                                onChange={() => setTransactionType('remove')}
                                className="hidden"
                            />
                            <FaMinus className="inline mr-2" /> Retirer
                        </label>
                    </div>

                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantité</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-center focus:ring-green-500 focus:border-green-500"
                            min="1"
                            required
                        />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Confirmer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAdjustmentModal;