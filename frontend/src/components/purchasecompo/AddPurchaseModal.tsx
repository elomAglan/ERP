import { useState, useRef } from "react";
import axios from "axios";
import { FaPlus, FaTrashAlt, FaTimes } from "react-icons/fa";

interface Item {
  id: number;
  name: string;
}

interface Store {
  id: number;
  name: string;
}

interface PurchaseItem {
  product_id: number;
  store_id: number;
  quantity: number;
  unit_price: number;
}

interface Props {
  items: Item[];
  stores: Store[];
  onClose: () => void;
  onCreated: () => void;
}

export default function AddPurchaseModal({ items, stores, onClose, onCreated }: Props) {
  const [supplier, setSupplier] = useState("");
  const [selectedItems, setSelectedItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pour gérer les focus après l'ajout d'un élément
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const addItem = () => {
    setSelectedItems([...selectedItems, { product_id: 0, store_id: 0, quantity: 1, unit_price: 0 }]);
    // Ajout d'un petit délai pour permettre au DOM de se mettre à jour
    setTimeout(() => {
      if (lastItemRef.current) {
        lastItemRef.current.querySelector("select")?.focus();
      }
    }, 0);
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...selectedItems];
    newItems[index][field] = value;
    setSelectedItems(newItems);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
    if (error) setError(null); // On efface l'erreur si l'utilisateur corrige le problème
  };

  const totalGlobal = selectedItems.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    if (!supplier.trim()) {
      setError("Le nom du fournisseur est requis.");
      setLoading(false);
      return;
    }

    if (selectedItems.length === 0) {
      setError("Vous devez ajouter au moins un article.");
      setLoading(false);
      return;
    }

    for (const item of selectedItems) {
      if (!item.product_id) {
        setError("Veuillez sélectionner un article pour chaque ligne.");
        setLoading(false);
        return;
      }
      if (!item.store_id) {
        setError("Veuillez sélectionner un magasin pour chaque ligne.");
        setLoading(false);
        return;
      }
      if (!item.unit_price || item.unit_price <= 0) {
        setError("Le prix unitaire doit être supérieur à zéro pour chaque article.");
        setLoading(false);
        return;
      }
    }

    try {
      await axios.post("http://localhost:5000/api/purchases", {
        supplier_name: supplier.trim(),
        items: selectedItems,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Erreur: " + (err.response?.data?.error || "Une erreur est survenue."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative p-8 bg-white w-full max-w-2xl m-4 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Créer un achat</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="supplier" className="block text-gray-700 font-medium mb-2">Fournisseur</label>
          <input
            id="supplier"
            type="text"
            value={supplier}
            onChange={e => setSupplier(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Nom du fournisseur"
          />
        </div>

        <div className="space-y-4 max-h-80 overflow-y-auto mb-4 p-2 custom-scrollbar">
          {selectedItems.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-4 rounded-lg shadow-sm"
              ref={idx === selectedItems.length - 1 ? lastItemRef : null}
            >
              <div className="w-full md:w-1/4">
                <label className="block text-xs text-gray-500 mb-1">Article</label>
                <select
                  value={item.product_id}
                  onChange={e => updateItem(idx, "product_id", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value={0}>Choisir un article</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>

              <div className="w-full md:w-1/5">
                <label className="block text-xs text-gray-500 mb-1">Quantité</label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="w-full md:w-1/4">
                <label className="block text-xs text-gray-500 mb-1">Magasin</label>
                <select
                  value={item.store_id}
                  onChange={e => updateItem(idx, "store_id", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value={0}>Choisir un magasin</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <div className="w-full md:w-1/5">
                <label className="block text-xs text-gray-500 mb-1">Prix unitaire</label>
                <input
                  type="number"
                  min={0}
                  value={item.unit_price}
                  onChange={e => updateItem(idx, "unit_price", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex-shrink-0 mt-4 md:mt-0">
                <button
                  onClick={() => removeItem(idx)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  aria-label="Supprimer l'article"
                >
                  <FaTrashAlt size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={addItem}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <FaPlus /> Ajouter un article
          </button>
          <div className="text-lg font-bold text-gray-800">
            Total global: {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(totalGlobal)}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className={`px-6 py-2 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            Créer l'achat
          </button>
        </div>
      </div>
    </div>
  );
}