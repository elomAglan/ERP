import { useEffect, useState } from "react";
import axios from "axios";

interface Item {
  id: number; // purchase_items.id
  name: string;
  quantity: number; // commandé
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

export default function ReceptionModal({ purchase, onClose,  }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [receivedItems, setReceivedItems] = useState<number[]>([]); // Pour feedback visuel

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/purchases/${purchase.id}`);
        setItems(res.data.items || []);
      } catch (err) {
        console.error("Erreur récupération achat:", err);
      }
    };
    fetchPurchase();
  }, [purchase]);

  const handleChange = (itemId: number, value: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: value }));
  };

  const handleReception = async (itemId: number) => {
    const qty = quantities[itemId] || 0;
    if (qty <= 0) {
      alert("Veuillez saisir une quantité valide.");
      return;
    }

    try {
    await axios.put(`http://localhost:5000/api/purchases/${purchase.id}/receive`, {
  items: [{ purchase_item_id: itemId, quantity_received: qty }],
});

      setReceivedItems([...receivedItems, itemId]); // Marquer comme reçu
    } catch (err) {
      console.error("Erreur réception:", err);
      alert("Erreur lors de la réception !");
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: "10px", fontSize: "20px" }}>
          Réception achat #{purchase.id}
        </h2>
        <p><strong>Fournisseur :</strong> {purchase.supplier_name}</p>
        <p><strong>Date :</strong> {new Date(purchase.date).toLocaleString()}</p>

        <table style={tableStyle}>
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th style={thStyle}>Article</th>
              <th style={thStyle}>Commandé</th>
              <th style={thStyle}>Déjà reçu</th>
              <th style={thStyle}>À recevoir</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "10px" }}>
                  Aucun article à recevoir
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.name}</td>
                  <td style={tdStyle}>{item.quantity}</td>
                  <td style={tdStyle}>{item.received_quantity}</td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      min={0}
                      max={item.quantity - item.received_quantity}
                      value={quantities[item.id] || ""}
                      onChange={(e) => handleChange(item.id, parseInt(e.target.value) || 0)}
                      style={inputStyle}
                      disabled={receivedItems.includes(item.id)}
                    />
                  </td>
                  <td style={tdStyle}>
                    {receivedItems.includes(item.id) || item.received_quantity >= item.quantity ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>✅ Reçu</span>
                    ) : (
                      <button onClick={() => handleReception(item.id)} style={btnPrimary}>
                        Recevoir
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <button onClick={onClose} style={btnSecondary}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// Styles
const overlayStyle: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: "white", padding: "20px", width: "750px", borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
};

const tableStyle: React.CSSProperties = {
  width: "100%", marginTop: "15px", borderCollapse: "collapse", fontSize: "14px"
};

const thStyle: React.CSSProperties = { border: "1px solid #ddd", padding: "8px", textAlign: "left" };
const tdStyle: React.CSSProperties = { border: "1px solid #ddd", padding: "8px" };
const inputStyle: React.CSSProperties = { width: "70px", padding: "5px", borderRadius: "6px", border: "1px solid #ccc" };
const btnPrimary: React.CSSProperties = { padding: "6px 12px", background: "#4CAF50", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" };
const btnSecondary: React.CSSProperties = { padding: "6px 12px", background: "#ccc", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer" };
