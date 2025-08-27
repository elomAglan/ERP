import React, { useState, useCallback } from "react";
import { FaPlus, FaSpinner, FaTimes } from "react-icons/fa";

// Définit l'interface de l'objet "Item".
// "salePrice" est maintenant requis, ce qui est crucial pour la cohérence des types.
interface Item {
  id: number;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
}

// Définit les props requises pour le composant AddItemModal.
interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<Item, 'id'>) => Promise<Item>;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  // Gère l'état du formulaire. Les valeurs sont des chaînes de caractères pour les inputs.
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    purchasePrice: "",
    salePrice: "",
  });
  // Gère l'état de chargement lors de la soumission du formulaire.
  const [isLoading, setIsLoading] = useState(false);
  // Gère les messages d'erreur.
  const [error, setError] = useState<string | null>(null);

  // Utilise useCallback pour mémoriser la fonction de gestion des changements,
  // ce qui optimise les performances en évitant les recréations inutiles de fonctions.
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Gère la soumission du formulaire, avec validation et gestion des erreurs.
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation côté client pour s'assurer que les champs obligatoires sont remplis.
    if (!formData.name || !formData.category || !formData.purchasePrice) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Convertit les prix en nombres, en gérant les cas où la conversion échoue.
    const parsedPurchasePrice = parseFloat(formData.purchasePrice);
    const parsedSalePrice = parseFloat(formData.salePrice);

    // Vérifie si le prix d'achat est un nombre valide.
    if (isNaN(parsedPurchasePrice)) {
      setError("Le prix d'achat doit être un nombre valide.");
      return;
    }

    // Crée le nouvel objet d'item pour l'envoi.
    // Si salePrice n'est pas un nombre, il est défini par défaut à 0.
    const newItemData: Omit<Item, 'id'> = {
      name: formData.name,
      category: formData.category,
      purchasePrice: parsedPurchasePrice,
      salePrice: isNaN(parsedSalePrice) ? 0 : parsedSalePrice,
    };

    setIsLoading(true);

    try {
      // Appelle la prop onAdd avec les nouvelles données de l'item.
      await onAdd(newItemData);
      // Réinitialise le formulaire et ferme le modal après un ajout réussi.
      setFormData({ name: "", category: "", purchasePrice: "", salePrice: "" });
      onClose();
    } catch (err) {
      // Affiche les messages d'erreur si la soumission échoue.
      setError(err instanceof Error ? err.message : "Échec de l'ajout de l'élément.");
    } finally {
      // Assure que l'état de chargement est désactivé, peu importe le résultat.
      setIsLoading(false);
    }
  }, [formData, onAdd, onClose]);

  // Si le modal n'est pas ouvert, ne rien afficher.
  if (!isOpen) {
    return null;
  }

  // Rendu du modal avec des styles Tailwind CSS.
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative transform transition-all duration-300 scale-100 opacity-100">
        
        {/* Bouton pour fermer le modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Fermer le modal"
          disabled={isLoading}
        >
          <FaTimes className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Ajouter un nouvel article</h2>
        
        {/* Affiche le message d'erreur si une erreur se produit */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Formulaire d'ajout d'article */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input 
            name="name" 
            placeholder="Nom *" 
            value={formData.name} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
            required
            aria-label="Nom de l'article"
          />
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
            aria-label="Catégorie de l'article"
          >
            <option value="">Sélectionner une catégorie *</option>
            <option value="Sale">Vente</option>
            <option value="Active Purchase">Achat Actif</option>
            <option value="Passive Purchase">Achat Passif</option>
          </select>
          <input 
            name="purchasePrice" 
            placeholder="Prix d'achat (CFA) *" 
            type="number" 
            step="0.01" 
            value={formData.purchasePrice} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
            aria-label="Prix d'achat"
          />
          <input 
            name="salePrice" 
            placeholder="Prix de vente (CFA) (Optionnel)" 
            type="number" 
            step="0.01" 
            value={formData.salePrice} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            aria-label="Prix de vente"
          />

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition disabled:opacity-50" 
              disabled={isLoading}>
              Annuler
            </button>
            <button 
              type="submit" 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed" 
              disabled={isLoading}
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaPlus className="w-4 h-4" />} 
              {isLoading ? "Ajout en cours..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
