import React from "react";
import type { Purchase } from "../../types/purchase";

interface PurchaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase;
}

const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
  isOpen,
  onClose,
  purchase,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-10">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Détails de l'achat</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <strong>Fournisseur :</strong> {purchase.supplier_name}
          </div>
          <div>
            <strong>Date :</strong> {new Date(purchase.date).toLocaleDateString()}
          </div>
          <div>
            <strong>Montant total :</strong> {purchase.total_amount} FCFA
          </div>
          <div>
            <strong>Statut :</strong> {purchase.status}
          </div>

          <div>
            <strong>Articles :</strong>
            <table className="w-full mt-2 border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Nom</th>
                  <th className="border px-2 py-1">Quantité</th>
                  <th className="border px-2 py-1">Prix unitaire</th>
                  <th className="border px-2 py-1">Magasin</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{item.product_name}</td>
                    <td className="border px-2 py-1">{item.quantity}</td>
                    <td className="border px-2 py-1">{item.unit_price}</td>
                    <td className="border px-2 py-1">{item.store_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <strong>Reçu de paiement :</strong>{" "}
            {purchase.receipt_url ? (
              <a
                href={purchase.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Voir Reçu
              </a>
            ) : (
              <span className="text-gray-400">Aucun reçu</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailModal;
