import { useState } from "react";
import { FaPlus } from "react-icons/fa";

// Interface pour un achat
interface Purchase {
    id: number;
    item: string;
    supplier: string;
    date: string;
    amount: number;
    document: string | null;
    status: "pending_payment" | "paid";
}

const availableItems = [
    'Équipement de bureau',
    'Matières premières',
    'Logiciel de comptabilité',
    'Services de maintenance',
    'Fournitures de nettoyage',
    'Abonnement Cloud'
];

const AddPurchaseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (purchase: Omit<Purchase, 'id' | 'status'>) => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        item: availableItems[0],
        supplier: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        document: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, document: e.target.files[0] });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            item: formData.item,
            supplier: formData.supplier,
            date: formData.date,
            amount: parseFloat(formData.amount),
            document: formData.document ? formData.document.name : null,
        });
        
        setFormData({
            item: availableItems[0],
            supplier: '',
            date: new Date().toISOString().split('T')[0],
            amount: '',
            document: null,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-10">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">Nouvel Achat</h3>
                    <p className="text-gray-600 mt-1">Saisissez rapidement un nouvel achat</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Article *</label>
                        <select
                            required
                            value={formData.item}
                            onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {availableItems.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur *</label>
                        <input
                            type="text"
                            required
                            value={formData.supplier}
                            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nom du fournisseur"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Montant (CFA) *</label>
                        <input
                            type="number"
                            required
                            step="1"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Justificatif (facture/reçu)</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {formData.document && (
                            <p className="mt-1 text-sm text-gray-500">
                                Fichier sélectionné : **{formData.document.name}**
                            </p>
                        )}
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
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus className="w-4 h-4" />
                            Enregistrer l'achat
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPurchaseModal;