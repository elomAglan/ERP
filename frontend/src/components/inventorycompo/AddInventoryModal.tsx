import React, { useState } from "react";

// Interface for new item data
interface NewItem {
    name: string;
    category: string;
    stock: number;
    unit_price: number;
    last_updated: string;
}

// Interface for modal props
interface AddInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (newItem: NewItem) => void;
    categories: string[];
}

const AddInventoryModal: React.FC<AddInventoryModalProps> = ({ isOpen, onClose, onAdd, categories }) => {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [stock, setStock] = useState<number | ''>('');
    const [unitPrice, setUnitPrice] = useState<number | ''>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Determine the final category
        const finalCategory = category === 'new' ? newCategory : category;

        if (name && finalCategory && stock !== '' && unitPrice !== '') {
            const newItem: NewItem = {
                name,
                category: finalCategory,
                stock: Number(stock),
                unit_price: Number(unitPrice),
                last_updated: new Date().toISOString().split('T')[0],
            };
            onAdd(newItem);
            
            // Reset the form
            setName('');
            setCategory('');
            setNewCategory('');
            setStock('');
            setUnitPrice('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Add New Item</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                            required
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                            <option value="new">Add New Category</option>
                        </select>
                    </div>
                    {category === 'new' && (
                        <div>
                            <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700">New Category Name</label>
                            <input
                                type="text"
                                id="newCategory"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                        <input
                            type="number"
                            id="stock"
                            value={stock}
                            onChange={(e) => setStock(Number(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">Unit Price (XOF)</label>
                        <input
                            type="number"
                            id="unitPrice"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(Number(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>
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
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddInventoryModal;