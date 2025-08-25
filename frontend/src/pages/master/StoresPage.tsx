import React, { useState, useMemo } from "react";
import { FaPlus, FaTrash, FaSearch, FaEdit } from "react-icons/fa";
import EditStoreModal from "../../components/storecompo/EditStoreModal";
import type { Store } from "../../types/Store.interface";

const StoresPage: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([
        { id: 1, code: "ST-001", name: "Main Warehouse", zone: ["North Zone"] },
        { id: 2, code: "ST-002", name: "Backup Store", zone: ["South Zone"] },
    ]);

    const [newStoreName, setNewStoreName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStores, setSelectedStores] = useState<number[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [storeToEdit, setStoreToEdit] = useState<Store | null>(null);

    const generateNewCode = (currentCount: number): string => {
        const paddedNumber = String(currentCount + 1).padStart(3, '0');
        return `ST-${paddedNumber}`;
    };

    const handleAdd = () => {
        if (!newStoreName) {
            alert("Please enter a name for the new store.");
            return;
        }
        const newId = stores.length > 0 ? Math.max(...stores.map(store => store.id)) + 1 : 1;
        const newCode = generateNewCode(stores.length);
        const newStore: Store = {
            id: newId,
            code: newCode,
            name: newStoreName,
            zone: ["Not Assigned"],
        };
        setStores([newStore, ...stores]);
        setNewStoreName("");
    };

    const handleEditStore = (store: Store) => {
        setStores(stores.map(s => (s.id === store.id ? store : s)));
        setStoreToEdit(null);
        setIsEditModalOpen(false);
    };

    const handleDeleteSelected = () => {
        if (selectedStores.length === 0) {
            alert("Please select at least one store to delete.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete the selected ${selectedStores.length} store(s)?`)) {
            setStores(stores.filter(store => !selectedStores.includes(store.id)));
            setSelectedStores([]);
        }
    };

    const handleEditSelected = () => {
        if (selectedStores.length === 0) {
            alert("Please select a store to edit.");
            return;
        }
        if (selectedStores.length > 1) {
            alert("Please select only one store at a time for editing.");
            return;
        }
        const storeToEdit = stores.find(store => store.id === selectedStores[0]);
        if (storeToEdit) {
            setStoreToEdit(storeToEdit);
            setIsEditModalOpen(true);
        }
    };

    const handleSort = (key: keyof Store) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredStores = useMemo(() => {
        let sortableStores = [...stores];
        if (searchTerm) {
            sortableStores = sortableStores.filter(store =>
                store.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.zone.some(z => z.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (sortConfig !== null) {
            sortableStores.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Store];
                const bValue = b[sortConfig.key as keyof Store];
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                // Pour les tableaux de chaînes (zones)
                if (Array.isArray(aValue) && Array.isArray(bValue)) {
                    const aStr = aValue.join(", ");
                    const bStr = bValue.join(", ");
                    return sortConfig.direction === 'ascending' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
                }
                return 0;
            });
        }
        return sortableStores;
    }, [stores, searchTerm, sortConfig]);

    const handleSelectAll = (checked: boolean) => {
        setSelectedStores(checked ? sortedAndFilteredStores.map(store => store.id) : []);
    };

    const handleSelectItem = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedStores(prev => [...prev, id]);
        } else {
            setSelectedStores(prev => prev.filter(storeId => storeId !== id));
        }
    };

    const isAllSelected = sortedAndFilteredStores.length > 0 && selectedStores.length === sortedAndFilteredStores.length;

    return (
        <div className="p-6 bg-gray-50 rounded-2xl shadow-lg min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Store Management</h2>
                    <p className="text-gray-600 mt-1">
                        Manage and track your company's physical stores.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="New Store Name"
                        value={newStoreName}
                        onChange={(e) => setNewStoreName(e.target.value)}
                    />
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FaPlus className="w-4 h-4" />
                        Add
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search stores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {selectedStores.length > 0 && (
                    <div className="flex gap-2">
                        {selectedStores.length === 1 && (
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('code')}>
                                <div className="flex items-center">Code</div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                                <div className="flex items-center">Name</div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('zone')}>
                                <div className="flex items-center">Zone</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedAndFilteredStores.length > 0 ? (
                            sortedAndFilteredStores.map((store) => (
                                <tr key={store.id} className={`hover:bg-gray-50 transition-colors duration-150 ${selectedStores.includes(store.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedStores.includes(store.id)}
                                            onChange={(e) => handleSelectItem(store.id, e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="py-2 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{store.code}</td>
                                    <td className="py-2 px-6 whitespace-nowrap text-sm text-gray-700">{store.name}</td>
                                    <td className="py-2 px-6 whitespace-nowrap text-sm text-gray-700">
                                        <div className="flex flex-wrap gap-1">
                                            {store.zone.map((z, index) => (
                                                <span key={index} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {z}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No stores found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    Showing {sortedAndFilteredStores.length} of {stores.length} stores
                </p>
            </div>
            <EditStoreModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditStore}
                storeToEdit={storeToEdit}
            />
        </div>
    );
};

export default StoresPage;