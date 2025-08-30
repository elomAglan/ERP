import { useEffect, useState } from "react";
import axios from "axios";
import { FaTimes, FaCheckCircle, FaSpinner } from "react-icons/fa";

interface Item {
  id: number;
  name: string;
  quantity: number;
  received_quantity: number;
}

interface Purchase {
  id: number;
  supplier_name: string;
  date: string;
}

interface Props {
  purchase: Purchase;
  onClose: () => void;
  onReceived: () => void;
}

export default function ReceptionModal({ purchase, onClose, onReceived }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [itemLoading, setItemLoading] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null); // Nouvel état pour les messages temporaires

  useEffect(() => {
    const fetchPurchase = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/purchases/${purchase.id}`);
        setItems(res.data.items || []);
      } catch (err) {
        console.error("Erreur récupération achat:", err);
        setError("Impossible de charger les articles. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [purchase]);

  const handleChange = (itemId: number, value: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: value }));
    if (error) setError(null);
  };

  const handleReception = async (itemId: number) => {
    const qty = quantities[itemId] || 0;
    if (qty <= 0) {
      setError("Veuillez saisir une quantité valide (> 0).");
      return;
    }

    const itemToReceive = items.find(item => item.id === itemId);
    if (!itemToReceive) return;

    if (itemToReceive.received_quantity + qty > itemToReceive.quantity) {
      setError("La quantité reçue est supérieure à la quantité commandée.");
      return;
    }

    setItemLoading(prev => ({ ...prev, [itemId]: true }));
    setError(null);
    setInfoMessage(null); // On efface l'ancien message

    try {
      await axios.put(`http://localhost:5000/api/purchases/${purchase.id}/receive`, {
        items: [{ purchase_item_id: itemId, quantity_received: qty }],
      });
      
      // Mise à jour de l'état local pour un feedback instantané
      const updatedReceivedQty = itemToReceive.received_quantity + qty;
      const remainingQty = itemToReceive.quantity - updatedReceivedQty;

      // Mise à jour de la liste d'articles avec la nouvelle quantité reçue
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId
            ? { ...item, received_quantity: updatedReceivedQty }
            : item
        )
      );

      // Afficher le message d'info si l'article n'est pas complètement reçu
      if (remainingQty > 0) {
        setInfoMessage(`${remainingQty} unité(s) restante(s) pour "${itemToReceive.name}".`);
        setTimeout(() => setInfoMessage(null), 3000); // Disparaît après 3 secondes
      }
      
      setQuantities(prev => ({ ...prev, [itemId]: 0 }));
      onReceived();
      
    } catch (err) {
      console.error("Erreur réception:", err);
      setError("Erreur lors de la réception de l'article !");
    } finally {
      setItemLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const isAllReceived = items.length > 0 && items.every(item => item.quantity <= item.received_quantity);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-xl">
          <FaSpinner className="animate-spin text-green-500 text-4xl mb-4" />
          <p className="text-gray-600">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative p-8 bg-white w-full max-w-3xl m-4 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Réception de l'achat <span className="text-green-600">#{purchase.id}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
            <p>{error}</p>
          </div>
        )}

        {infoMessage && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded-md transition-opacity duration-500" role="status">
            <p>{infoMessage}</p>
          </div>
        )}

        <div className="mb-6 text-gray-700">
          <p><strong>Fournisseur :</strong> {purchase.supplier_name}</p>
          <p><strong>Date de commande :</strong> {new Date(purchase.date).toLocaleString('fr-FR')}</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Commandé</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Déjà reçu</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité à recevoir</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    <p>Aucun article dans cet achat.</p>
                  </td>
                </tr>
              ) : (
                items.map(item => {
                  const remainingQty = item.quantity - item.received_quantity;
                  const isFullyReceived = remainingQty <= 0;
                  const isLoading = itemLoading[item.id];
                  
                  return (
                    <tr key={item.id} className={isFullyReceived ? "bg-green-50" : "hover:bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                          {item.received_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="number"
                          min={1}
                          max={remainingQty}
                          value={quantities[item.id] || ""}
                          onChange={(e) => handleChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-20 p-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                          disabled={isFullyReceived || isLoading}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {isFullyReceived ? (
                          <span className="flex items-center justify-center text-green-600 font-bold">
                            <FaCheckCircle className="mr-2" /> Complété
                          </span>
                        ) : (
                          <button
                            onClick={() => handleReception(item.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              "Recevoir"
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          {isAllReceived ? (
            <div className="flex-grow text-center text-green-700 font-bold">
              Tous les articles de cet achat ont été reçus.
            </div>
          ) : null}
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}