import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaExchangeAlt,  } from "react-icons/fa";

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

interface ModalProps {
  title: string;
  products: ProductStock[];
  onClose: () => void;
  onSave: (adjustedProducts: ProductStock[]) => void;
  stores?: Store[];
  transferStoreId?: number | null;
  setTransferStoreId?: React.Dispatch<React.SetStateAction<number | null>>;
}

const InventoryModal: React.FC<ModalProps> = ({ title, products, onClose, onSave, stores, transferStoreId, setTransferStoreId }) => {
  const [modalProducts, setModalProducts] = useState<ProductStock[]>([]);

  useEffect(() => {
    setModalProducts(products.map(p => ({ ...p, counted_qty: 0, transfer_qty: 0 })));
  }, [products]);

  const isTransfer = title.includes("Transfert");

  const handleQtyChange = (productId: number, value: number, type: "counted" | "transfer") => {
    setModalProducts(prev => prev.map(p => {
      if (p.product_id === productId) {
        if (type === "counted") {
          return { ...p, counted_qty: value };
        } else {
          return { ...p, transfer_qty: value };
        }
      }
      return p;
    }));
  };

  const handleSave = () => {
    onSave(modalProducts);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            <p className="text-gray-600 mt-1">
              {isTransfer ? "Sélectionnez les quantités à transférer" : "Saisissez les quantités comptées"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {isTransfer && stores && setTransferStoreId && (
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Magasin de destination</label>
            <select
              value={transferStoreId ?? ""}
              onChange={(e) => setTransferStoreId(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Sélectionnez un magasin</option>
              {stores.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Produit</th>
                <th className="p-4 text-right text-sm font-medium text-gray-700">Stock Actuel</th>
                <th className="p-4 text-right text-sm font-medium text-gray-700">{isTransfer ? "Qté à Transférer" : "Qté Comptée"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {modalProducts.map((product) => (
                <tr key={product.product_id} className="hover:bg-gray-50">
                  <td className="p-4"><div className="text-sm font-medium text-gray-900">{product.name}</div></td>
                  <td className="p-4 text-right"><span className="text-gray-600">{product.current_stock}</span></td>
                  <td className="p-4 text-right">
                    <input
                      type="number"
                      min={0}
                      max={isTransfer ? product.current_stock : undefined}
                      value={isTransfer ? (product.transfer_qty ?? "") : (product.counted_qty ?? "")}
                      onChange={(e) => handleQtyChange(product.product_id, Number(e.target.value), isTransfer ? "transfer" : "counted")}
                      className="w-20 p-2 border border-gray-300 rounded text-center"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Annuler</button>
          <button
            onClick={handleSave}
            className={`px-6 py-2 rounded-lg text-white font-medium transition disabled:opacity-50 flex items-center ${isTransfer ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isTransfer ? <FaExchangeAlt className="mr-2" /> : <FaCheck className="mr-2" />}
            {isTransfer ? "Transférer" : "Valider"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;