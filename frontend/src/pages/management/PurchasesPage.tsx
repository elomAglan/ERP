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
  const [files, setFiles] = useState<{ [key: number]: File | null }>({});

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

  // Télécharger le bon de commande PDF
  const handleDownloadPDF = (purchaseId: number) => {
    window.open(`http://localhost:5000/api/purchases/${purchaseId}/pdf`, "_blank");
  };

  // Sélection fichier reçu
  const handleFileChange = (purchaseId: number, file: File | null) => {
    setFiles(prev => ({ ...prev, [purchaseId]: file }));
  };

  // Upload reçu
  const handleUploadReceipt = async (purchaseId: number) => {
  const file = files[purchaseId];
  if (!file) {
    alert("Veuillez sélectionner un fichier.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    await axios.put(`http://localhost:5000/api/purchases/${purchaseId}/receipt`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("Reçu uploadé avec succès !");
    setFiles(prev => ({ ...prev, [purchaseId]: null }));
    fetchData(); // rafraîchir la liste des achats
  } catch (err) {
    console.error("Erreur upload reçu :", err);
    alert("Erreur lors de l'upload du reçu.");
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h1>Achats</h1>
      <button style={btnPrimary} onClick={() => setShowAddModal(true)}>
        Créer un achat
      </button>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fournisseur</th>
            <th>Total</th>
            <th>Date</th>
            <th>Réception</th>
            <th>Bon de commande</th>
            <th>Reçu</th>
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
                <button style={btnPrimary} onClick={() => setShowReceptionModal(p)}>
                  Réception
                </button>
              </td>
              <td>
                <button style={btnSecondary} onClick={() => handleDownloadPDF(p.id)}>
                  Télécharger BC
                </button>
              </td>
              <td>
                <div style={{ display:"flex", gap:"5px" }}>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(p.id, e.target.files ? e.target.files[0] : null)}
                  />
                  <button style={btnPrimary} onClick={() => handleUploadReceipt(p.id)}>
                    Upload
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal ajout */}
      {showAddModal && (
        <AddPurchaseModal 
          items={items} 
          stores={stores} 
          onClose={() => setShowAddModal(false)} 
          onCreated={fetchData} 
        />
      )}

      {/* Modal réception */}
      {showReceptionModal && (
        <ReceptionModal 
          purchase={showReceptionModal}
          onClose={() => setShowReceptionModal(null)} 
          onReceived={fetchData} 
        />
      )}
    </div>
  );
}

/* ---- Styles simples ---- */
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 20,
};

const btnPrimary: React.CSSProperties = {
  padding: "6px 12px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "6px 12px",
  background: "#2196F3",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
