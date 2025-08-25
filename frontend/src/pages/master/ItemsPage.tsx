import { useState, useMemo } from 'react';
import { FaPlus, FaTrash, FaSearch, FaEdit } from "react-icons/fa";

import AddItemModal from "../../components/itemcompo/AddItemModal";
import EditItemModal from "../../components/itemcompo/EditItemModal";

interface Item {
    id: number;
    name: string;
    category: string;
    price: number;
}

const ItemsPage: React.FC = () => {
    const [items, setItems] = useState<Item[]>([
        { id: 1, name: "Office Chair", category: "Sale", price: 120 },
        { id: 2, name: "Laptop Dell XPS", category: "Active Purchase", price: 1500 },
        { id: 3, name: "Desk Lamp", category: "Passive Purchase", price: 45 },
        { id: 4, name: "Notebook", category: "Sale", price: 8 },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const handleAddItem = (newItemData: Omit<Item, 'id'>) => {
        const newItem: Item = {
            ...newItemData,
            id: items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1,
        };
        setItems([newItem, ...items]);
    };

    const handleEditItem = (item: Item) => {
        setItems(items.map(i => (i.id === item.id ? item : i)));
        setItemToEdit(null);
        setIsEditModalOpen(false);
    };

    const handleEditSelected = () => {
        if (selectedItems.length === 0) {
            alert("Please select an item to edit.");
            return;
        }
        if (selectedItems.length > 1) {
            alert("Please select only one item at a time for editing.");
            return;
        }
        const itemToEdit = items.find(item => item.id === selectedItems[0]);
        if (itemToEdit) {
            setItemToEdit(itemToEdit);
            setIsEditModalOpen(true);
        }
    };

    const handleDeleteSelected = () => {
        if (selectedItems.length === 0) {
            alert("Please select at least one item to delete.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete the selected ${selectedItems.length} item(s)?`)) {
            setItems(items.filter(item => !selectedItems.includes(item.id)));
            setSelectedItems([]);
        }
    };

    const handleSort = (key: string) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Item];
                const bValue = b[sortConfig.key as keyof Item];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const filteredItems = sortedItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = (checked: boolean) => {
        setSelectedItems(checked ? filteredItems.map(item => item.id) : []);
    };

    const handleSelectItem = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedItems(prev => [...prev, id]);
        } else {
            setSelectedItems(prev => prev.filter(itemId => itemId !== id));
        }
    };

    const isAllSelected = filteredItems.length > 0 &&
        selectedItems.length === filteredItems.length;

    return (
        <div className="p-6 bg-gray-50 rounded-2xl shadow-lg min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Item Management</h2>
                    <p className="text-gray-600 mt-1">
                        Manage and track all items in your inventory.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FaPlus className="w-4 h-4" />
                    Add Item
                </button>
            </div>

            <div className="mb-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search items or categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="h-12 flex justify-end items-center mb-2 gap-2">
                {selectedItems.length > 0 && (
                    <div className="flex gap-2">
                        {selectedItems.length === 1 && (
                            <button
                                onClick={handleEditSelected}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                                <FaEdit className="w-3 h-3" />
                                Edit
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
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-6 text-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('id')}>
                                <div className="flex items-center">ID</div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                                <div className="flex items-center">Name</div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('category')}>
                                <div className="flex items-center">Category</div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>
                                <div className="flex items-center">Price ($)</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <tr key={item.id} className={`hover:bg-gray-50 transition-colors duration-150 ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                        ${item.price.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No items found. Try a different search or add a new item.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    Showing {filteredItems.length} of {items.length} items
                </p>
                <p className="text-sm font-medium text-gray-800">
                    Total Value: ${filteredItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                </p>
            </div>

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddItem}
            />
            <EditItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditItem}
                itemToEdit={itemToEdit}
            />
        </div>
    );
};

export default ItemsPage;