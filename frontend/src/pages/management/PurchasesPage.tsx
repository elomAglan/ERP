import { useEffect, useState } from "react";
import axios from "axios";
import AddPurchaseModal from "../../components/purchasecompo/AddPurchaseModal";
import ReceptionModal from "../../components/purchasecompo/ReceptionModal";

interface Item { id: number; name: string; }
interface Store { id: number; name: string; }
interface Purchase { 
  id: number; 
  supplier_name: string; 
  total_amount: number; 
  date: string; 
  items?: any[]; 
}

export default function PurchasesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceptionModal, setShowReceptionModal] = useState<Purchase | null>(null);

  const fetchData = async () => {
    const [itemsRes, storesRes, purchasesRes] = await Promise.all([
      axios.get("http://localhost:5000/api/items"),
      axios.get("http://localhost:5000/api/stores"),
      axios.get("http://localhost:5000/api/purchases"),
    ]);
    setItems(itemsRes.data);
    setStores(storesRes.data);
    setPurchases(purchasesRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div style={{ padding:20 }}>
      <h1>Achats</h1>
      <button onClick={() => setShowAddModal(true)}>Créer un achat</button>

      <table style={{ width:"100%", borderCollapse:"collapse", marginTop:20 }}>
        <thead>
          <tr>
            <th>ID</th><th>Fournisseur</th><th>Total</th><th>Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.supplier_name}</td>
              <td>{p.total_amount}</td>
              <td>{new Date(p.date).toLocaleString()}</td>
              <td>
                <button onClick={() => setShowReceptionModal(p)}>Réception</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <AddPurchaseModal 
          items={items} 
          stores={stores} 
          onClose={() => setShowAddModal(false)} 
          onCreated={fetchData} 
        />
      )}

      {showReceptionModal && (
        <ReceptionModal 
          purchase={showReceptionModal}   // ✅ on passe tout l'objet achat
          onClose={() => setShowReceptionModal(null)} 
          onReceived={fetchData} 
        />
      )}
    </div>
  );
}
