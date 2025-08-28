import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaWarehouse, FaBoxOpen, FaExchangeAlt, FaSpinner, FaTimes, FaCheck } from "react-icons/fa";
import StockTable from "../../components/inventorycompo/StockTable";
import InventoryModal from "../../components/inventorycompo/InventoryModal";

interface ProductStock {
  product_id: number;
  name: string;
  current_stock: number;
  counted_qty?: number;
  transfer_qty?: number;
}

interface Store {
  id: number;
  name: string;
}

const API_BASE = "http://localhost:5000/api";

const InventoryManager: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [stock, setStock] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"inventory" | "transfer" | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [transferStoreId, setTransferStoreId] = useState<number | null>(null);

  const showFeedback = (message: string, isError = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 5000);
  };

  useEffect(() => {
    axios.get<Store[]>(`${API_BASE}/stores`)
      .then((res) => setStores(Array.isArray(res.data) ? res.data : []))
      .catch(() => showFeedback("Échec du chargement des magasins.", true));
  }, []);

  useEffect(() => {
    if (!selectedStoreId) {
      setStock([]);
      return;
    }
    setLoading(true);
    axios.get<ProductStock[]>(`${API_BASE}/inventory/${selectedStoreId}`)
      .then((res) => setStock(Array.isArray(res.data) ? res.data : []))
      .catch(() => showFeedback("Échec du chargement de l'inventaire.", true))
      .finally(() => setLoading(false));
  }, [selectedStoreId]);

  const handleOpenModal = (type: "inventory" | "transfer") => {
    if (selectedProductIds.length === 0) {
      showFeedback("Veuillez sélectionner au moins un produit.", true);
      return;
    }
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setTransferStoreId(null);
  };

  const filteredStock = stock.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour gérer l’ajout d’un nouvel article


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaWarehouse className="mr-3 text-indigo-600" /> Gestion d'Inventaire
          </h1>
          <p className="text-gray-600 mt-2">Effectuez des inventaires et transférez des stocks entre magasins.</p>
        </div>

        {feedback && (
          <div className={`fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center animate-fade-in ${feedback.isError ? "bg-red-500" : "bg-green-500"}`}>
            {feedback.isError ? <FaTimes className="mr-2" /> : <FaCheck className="mr-2" />}
            {feedback.message}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Magasin</label>
              <select
                value={selectedStoreId ?? ""}
                onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="" disabled>Sélectionnez un magasin</option>
                {stores.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
              <input
                type="text"
                placeholder="Filtrer les produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                disabled={!selectedStoreId}
              />
            </div>
            <div className="col-span-1 flex items-end space-x-2">
              <button
                onClick={() => handleOpenModal("inventory")}
                disabled={!selectedStoreId || loading || selectedProductIds.length === 0}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                <FaBoxOpen className="mr-2" /> Inventaire
              </button>
              <button
                onClick={() => handleOpenModal("transfer")}
                disabled={!selectedStoreId || loading || selectedProductIds.length === 0}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                <FaExchangeAlt className="mr-2" /> Transfert
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm"><FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-3" /> <p className="text-gray-600">Chargement de l'inventaire...</p></div>
        ) : selectedStoreId ? (
          <StockTable
            stock={filteredStock}
            selectedProductIds={selectedProductIds}
            setSelectedProductIds={setSelectedProductIds}
          />
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm"><FaWarehouse className="text-gray-300 text-5xl mx-auto mb-4" /> <h3 className="text-lg font-medium text-gray-700 mb-2">Sélectionnez un magasin</h3><p className="text-gray-500">Veuillez choisir un magasin pour voir son inventaire</p></div>
        )}

        {isModalOpen && modalType === "inventory" && (
          <InventoryModal
            title="Ajustement d'Inventaire"
            products={stock.filter(p => selectedProductIds.includes(p.product_id))}
            onClose={handleCloseModal}
            onSave={async (adjustedStock) => {
              const adjustments = adjustedStock
                .filter(p => (p.counted_qty ?? 0) > 0)
                .map(p => ({
                  product_id: p.product_id,
                  store_id: selectedStoreId,
                  counted_qty: p.counted_qty,
                  inventory_reference: `INV-${Date.now()}`,
                  zone: null,
                }));
              try {
                await axios.post(`${API_BASE}/inventory/adjust/batch`, { adjustments });
                showFeedback("Inventaire ajusté avec succès !");
                handleCloseModal();
                const res = await axios.get(`${API_BASE}/inventory/${selectedStoreId}`);
                setStock(res.data.map((p: ProductStock) => ({ ...p, counted_qty: 0 })));
                setSelectedProductIds([]);
              } catch (err) {
                showFeedback("Erreur lors de l'ajustement de l'inventaire.", true);
              }
            }}
          />
        )}
        
        {isModalOpen && modalType === "transfer" && (
          <InventoryModal
            title="Transfert de Stock"
            products={stock.filter(p => selectedProductIds.includes(p.product_id))}
            onClose={handleCloseModal}
            onSave={async (adjustedStock) => {
              if (!transferStoreId) {
                showFeedback("Veuillez choisir un magasin de destination.", true);
                return;
              }
              const transfers = adjustedStock
                .filter(p => (p.transfer_qty ?? 0) > 0)
                .map(p => ({
                  product_id: p.product_id,
                  from_store_id: selectedStoreId,
                  to_store_id: transferStoreId,
                  quantity: p.transfer_qty,
                }));
              try {
                await axios.post(`${API_BASE}/inventory/transfer`, { transfers });
                showFeedback("Transfert de stock réussi !");
                handleCloseModal();
                const res = await axios.get(`${API_BASE}/inventory/${selectedStoreId}`);
                setStock(res.data.map((p: ProductStock) => ({ ...p, transfer_qty: 0 })));
                setSelectedProductIds([]);
                setTransferStoreId(null);
              } catch (err) {
                showFeedback("Erreur lors du transfert de stock.", true);
              }
            }}
            stores={stores.filter(s => s.id !== selectedStoreId)}
            transferStoreId={transferStoreId}
            setTransferStoreId={setTransferStoreId}
          />
        )}
      </div>
    </div>
  );
};

export default InventoryManager;