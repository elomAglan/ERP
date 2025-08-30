import React, { useState } from "react";
import type { Purchase } from "../../types/purchase";

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase; // <-- on passe tout l'objet purchase
  onPay: (id: number, paymentMethod: string) => Promise<void>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  purchase,
  onPay,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert("Veuillez choisir un mode de paiement.");
      return;
    }
    await onPay(purchase.id, paymentMethod);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Paiement de l’achat</h2>
        <p className="mb-2">
          <span className="font-semibold">Fournisseur :</span>{" "}
          {purchase.supplier_name}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Montant :</span>{" "}
          {purchase.total_amount} FCFA
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">
              Méthode de paiement :
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Choisir --</option>
              <option value="cash">Espèces</option>
              <option value="card">Carte bancaire</option>
              <option value="transfer">Virement</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
