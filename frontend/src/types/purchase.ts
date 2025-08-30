// src/types/purchase.ts

export interface PurchaseItem {
  product_id: number;    // id réel du produit
  product_name: string;  // nom affiché dans la table ou modal
  quantity: number;      // quantité achetée (commandée initialement)
  unit_price: number;    // prix unitaire
  store_id: number;      // id du magasin
  bc_number?: string | null;

  // --- Champs supplémentaires pour gestion des réceptions partielles ---
  ordered_quantity: number;     // quantité commandée totale
  received_quantity: number;    // quantité reçue jusqu'à présent
  remaining_quantity: number;   // quantité restante à réceptionner
}

export type PurchaseStatus =
  | "pending"           // Achat créé, en attente
  | "order_generated"   // Bon de commande généré
  | "partially_executed" // Réception partielle
  | "executed"          // Tout reçu
  | "paid";             // Achat payé

export interface Purchase {
  id: number;                 // id de l'achat
  supplier_name: string;      // nom du fournisseur
  total_amount: number;       // montant total
  date: string;               // date ISO
  status: PurchaseStatus;     // statut de l'achat
  items?: PurchaseItem[];     // liste des articles achetés
  receipt_url?: string | null; // chemin du reçu uploadé
  bc_number?: string | null;
}
