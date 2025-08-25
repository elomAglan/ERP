import { useState } from 'react';
import { FaPlus, FaTrash, FaSearch, FaFilter, FaCheckCircle, FaFileDownload, FaUpload } from "react-icons/fa";

// Importez les modaux
import AddPurchaseModal from "../components/purchasecompo/AddPurchaseModal";
import PurchaseDetailModal from "../components/purchasecompo/PurchaseDetailModal";
import AttachJustificatifModal from "../components/purchasecompo/AttachJustificatifModal";
// Importez le nouveau modal de filtre
import FilterModal from "../components/purchasecompo/FilterModal";

// Interface simplifiée pour le nouveau processus
interface Purchase {
    id: number;
    item: string;
    supplier: string;
    date: string;
    amount: number;
    document: string | null;
    status: "pending_payment" | "paid";
}

const initialPurchases: Purchase[] = [
    { id: 1, item: 'Licence Logiciel Comptable', supplier: 'Tech Innovations', date: '2025-08-20', amount: 250000, document: 'facture-001.pdf', status: 'paid' },
    { id: 2, item: 'Fournitures de bureau', supplier: 'Bureau Facile', date: '2025-08-18', amount: 85000, document: null, status: 'pending_payment' },
    { id: 3, item: 'Maintenance serveurs', supplier: 'Infra Services', date: '2025-08-15', amount: 1200000, document: 'reçu-005.pdf', status: 'pending_payment' },
];

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(
        new Date(date)
    );

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
        case 'paid': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const PurchasesPage = () => {
    const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
    // État pour le nouveau modal de filtre
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPurchases, setSelectedPurchases] = useState<number[]>([]);
    const [selectedPurchaseToDetail, setSelectedPurchaseToDetail] = useState<Purchase | null>(null);
    const [selectedPurchaseToAttach, setSelectedPurchaseToAttach] = useState<Purchase | null>(null);
    // Nouvel état pour les filtres actifs
    const [activeFilters, setActiveFilters] = useState({
        paid: false,
        pending: false,
        noDocument: false,
    });

    const total = purchases.reduce((sum, p) => sum + p.amount, 0);

    const filteredPurchases = purchases.filter(purchase => {
        const matchesSearchTerm =
            purchase.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
            purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            (!activeFilters.paid && !activeFilters.pending) ||
            (activeFilters.paid && purchase.status === 'paid') ||
            (activeFilters.pending && purchase.status === 'pending_payment');

        const matchesDocument =
            !activeFilters.noDocument || (activeFilters.noDocument && purchase.document === null);

        return matchesSearchTerm && matchesStatus && matchesDocument;
    });
    
    const selectedPendingPurchases = purchases.filter(p => selectedPurchases.includes(p.id) && p.status === 'pending_payment');

    const handleAddPurchase = (newPurchase: Omit<Purchase, 'id' | 'status'>) => {
        const newPurchaseWithId: Purchase = {
            ...newPurchase,
            id: Math.max(...purchases.map(p => p.id), 0) + 1,
            status: 'pending_payment',
        };
        setPurchases([newPurchaseWithId, ...purchases]);
    };
    
    const handleMarkAsPaid = () => {
        const paidPurchaseIds = selectedPendingPurchases.map(p => p.id);
        if (paidPurchaseIds.length === 0) {
            alert("Veuillez sélectionner au moins une commande 'en attente de paiement' pour la marquer comme payée.");
            return;
        }

        setPurchases(purchases.map(p => {
            if (paidPurchaseIds.includes(p.id)) {
                return { ...p, status: 'paid' };
            }
            return p;
        }));
        setSelectedPurchases([]);
    };
    
    const handleAttachJustificatif = () => {
        if (selectedPurchases.length === 1) {
            const selected = purchases.find(p => p.id === selectedPurchases[0]);
            if (selected) {
                setSelectedPurchaseToAttach(selected);
                setIsAttachModalOpen(true);
            }
        } else {
            alert("Veuillez sélectionner une seule commande pour ajouter/modifier un justificatif.");
        }
    };
    
    const onAttachJustificatif = (purchaseId: number, documentName: string) => {
        setPurchases(purchases.map(p => {
            if (p.id === purchaseId) {
                return { ...p, document: documentName };
            }
            return p;
        }));
    };
    
    const handleViewDetail = () => {
        if (selectedPurchases.length === 1) {
            const selected = purchases.find(p => p.id === selectedPurchases[0]);
            if (selected) {
                setSelectedPurchaseToDetail(selected);
                setIsDetailModalOpen(true);
            }
        } else {
            alert("Veuillez sélectionner une seule commande pour voir les détails.");
        }
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedPurchases(checked ? filteredPurchases.map(p => p.id) : []);
    };

    const handleSelectPurchase = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedPurchases([...selectedPurchases, id]);
        } else {
            setSelectedPurchases(selectedPurchases.filter(pId => pId !== id));
        }
    };

    const handleDeleteSelected = () => {
        if(window.confirm("Êtes-vous sûr de vouloir supprimer les achats sélectionnés ?")) {
            setPurchases(purchases.filter(p => !selectedPurchases.includes(p.id)));
            setSelectedPurchases([]);
        }
    };

    const isAllSelected = filteredPurchases.length > 0 && 
        selectedPurchases.length === filteredPurchases.length;
        
    const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;


    return (
        <div className="p-6 bg-gray-50 rounded-2xl shadow-lg min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Gestion des Achats</h2>
                    <p className="text-gray-600 mt-1">
                        Enregistrez, gérez et suivez les achats de l'entreprise en quelques clics.
                    </p>
                </div>
                
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FaPlus className="w-4 h-4" />
                    Nouvel Achat
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un article ou fournisseur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button 
                    onClick={() => setIsFilterModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
                >
                    <FaFilter className="w-4 h-4" />
                    Filtres
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>
            
            <div className="h-12 flex justify-end items-center mb-2 gap-2">
                {selectedPurchases.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleViewDetail}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                        >
                            <FaFileDownload className="w-3 h-3" />
                            Voir détails
                        </button>
                        
                        {selectedPurchases.length === 1 && (
                            <button
                                onClick={handleAttachJustificatif}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                            >
                                <FaUpload className="w-3 h-3" />
                                Ajouter/Modifier le justificatif
                            </button>
                        )}
                        
                        {selectedPendingPurchases.length > 0 && (
                             <button
                                onClick={handleMarkAsPaid}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                                <FaCheckCircle className="w-3 h-3" />
                                Marquer comme payé
                            </button>
                        )}
                        <button
                            onClick={handleDeleteSelected}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                        >
                            <FaTrash className="w-3 h-3" />
                            Supprimer
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
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredPurchases.map((purchase) => (
                            <tr 
                                key={purchase.id} 
                                className={`hover:bg-gray-50 transition-colors ${
                                    selectedPurchases.includes(purchase.id) ? 'bg-blue-50' : ''
                                }`}
                            >
                                <td className="py-4 px-6 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedPurchases.includes(purchase.id)}
                                        onChange={(e) => handleSelectPurchase(purchase.id, e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                </td>
                                <td className="py-4 px-6 text-sm font-medium text-gray-900">{purchase.item}</td>
                                <td className="py-4 px-6 text-sm text-gray-700">{purchase.supplier}</td>
                                <td className="py-4 px-6 text-sm text-gray-700">{formatDate(purchase.date)}</td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(purchase.status)}`}>
                                        {purchase.status === 'pending_payment' && 'En attente de paiement'}
                                        {purchase.status === 'paid' && 'Payé'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-700 text-right font-mono">{formatCurrency(purchase.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                        <tr>
                            <td colSpan={5} className="py-4 px-6 text-right font-semibold text-gray-800">
                                Total :
                            </td>
                            <td className="py-4 px-6 text-right font-semibold text-gray-800 font-mono">
                                {formatCurrency(total)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <AddPurchaseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddPurchase}
            />
            
            <PurchaseDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                purchase={selectedPurchaseToDetail}
            />
            
            <AttachJustificatifModal
                isOpen={isAttachModalOpen}
                onClose={() => setIsAttachModalOpen(false)}
                onAttach={onAttachJustificatif}
                purchase={selectedPurchaseToAttach}
            />
            
            {/* Nouveau modal pour les filtres */}
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
            />
        </div>
    );
};

export default PurchasesPage;