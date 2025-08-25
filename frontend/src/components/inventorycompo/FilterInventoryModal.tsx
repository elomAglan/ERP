import React from "react";
import { FaFilter } from "react-icons/fa";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeFilters: {
        lowStock: boolean;
        category: string;
    };
    onFilterChange: React.Dispatch<React.SetStateAction<{
        lowStock: boolean;
        category: string;
    }>>;
    categories: string[];
}

const FilterInventoryModal: React.FC<FilterModalProps> = ({ isOpen, onClose, activeFilters, onFilterChange, categories }) => {
    if (!isOpen) return null;

    const handleCheckboxChange = (filterName: keyof typeof activeFilters) => {
        onFilterChange(prevFilters => ({
            ...prevFilters,
            [filterName]: !prevFilters[filterName]
        }));
    };
    
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange(prevFilters => ({
            ...prevFilters,
            category: e.target.value
        }));
    };

    const handleClearFilters = () => {
        onFilterChange({
            lowStock: false,
            category: 'all',
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <FaFilter />
                        Filter Inventory
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        &times;
                    </button>
                </div>
                
                <div className="space-y-4">
                    {/* Filter by stock status */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">By Stock Status</p>
                        <div className="flex items-center">
                            <label className="flex items-center space-x-2 text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.lowStock}
                                    onChange={() => handleCheckboxChange('lowStock')}
                                    className="rounded text-green-600"
                                />
                                <span>Low Stock (&lt; 10)</span>
                            </label>
                        </div>
                    </div>
                    
                    {/* Filter by category */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">By Category</p>
                        <select
                            id="category-filter"
                            value={activeFilters.category}
                            onChange={handleCategoryChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterInventoryModal;