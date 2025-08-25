import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";

interface Item {
    id: number;
    name: string;
    category: string;
    price: number;
}

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Item) => void;
    itemToEdit: Item | null;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [formData, setFormData] = useState<Omit<Item, 'id'>>({ name: "", category: "", price: 0 });

    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                name: itemToEdit.name,
                category: itemToEdit.category,
                price: itemToEdit.price,
            });
        }
    }, [itemToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemToEdit) return;
        onSave({
            ...itemToEdit,
            ...formData,
        });
        onClose();
    };

    if (!isOpen || !itemToEdit) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-10">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">Edit Item</h3>
                    <p className="text-gray-600 mt-1">Modify the details of the selected item.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a category</option>
                            <option value="Sale">Sale</option>
                            <option value="Active Purchase">Active Purchase</option>
                            <option value="Passive Purchase">Passive Purchase</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaEdit className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditItemModal;