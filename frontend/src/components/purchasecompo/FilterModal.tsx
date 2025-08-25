import React from "react";
import { FaFilter } from "react-icons/fa";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeFilters: {
        paid: boolean;
        pending: boolean;
        noDocument: boolean;
    };
    onFilterChange: React.Dispatch<React.SetStateAction<{
        paid: boolean;
        pending: boolean;
        noDocument: boolean;
    }>>;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, activeFilters, onFilterChange }) => {
    if (!isOpen) return null;

    const handleCheckboxChange = (filterName: keyof typeof activeFilters) => {
        onFilterChange(prevFilters => ({
            ...prevFilters,
            [filterName]: !prevFilters[filterName]
        }));
    };
    
    const handleClearFilters = () => {
        onFilterChange({
            paid: false,
            pending: false,
            noDocument: false,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <FaFilter />
                        Filtrer les achats
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        &times;
                    </button>
                </div>
                
                <div className="space-y-4">
                    {/* Filtre par statut */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Par Statut de Paiement</p>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center space-x-2 text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.paid}
                                    onChange={() => handleCheckboxChange('paid')}
                                    className="rounded text-blue-600"
                                />
                                <span>Payé</span>
                            </label>
                            <label className="flex items-center space-x-2 text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.pending}
                                    onChange={() => handleCheckboxChange('pending')}
                                    className="rounded text-blue-600"
                                />
                                <span>En attente de paiement</span>
                            </label>
                        </div>
                    </div>
                    
                    {/* Filtre par justificatif */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Par Justificatif</p>
                        <div className="flex items-center">
                            <label className="flex items-center space-x-2 text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.noDocument}
                                    onChange={() => handleCheckboxChange('noDocument')}
                                    className="rounded text-blue-600"
                                />
                                <span>Sans justificatif</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Effacer les filtres
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;