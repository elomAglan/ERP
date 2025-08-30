import { useState } from "react";
import axios from "axios";

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

  const addItem = () => setSelectedItems([...selectedItems, { product_id: 0, store_id: 0, quantity: 1, unit_price: 0 }]);

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...selectedItems];
    newItems[index][field] = value;
    setSelectedItems(newItems);
  };

  const removeItem = (index: number) => setSelectedItems(selectedItems.filter((_, i) => i !== index));

  const totalGlobal = selectedItems.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  const handleCreate = async () => {
    if (!supplier) return alert("Fournisseur requis");
    if (selectedItems.length === 0) return alert("Au moins un article requis");
    for (const item of selectedItems) {
      if (!item.product_id) return alert("Sélectionner un article");
      if (!item.store_id) return alert("Sélectionner un magasin");
      if (!item.unit_price) return alert("Remplir le prix unitaire");
    }

    try {
      await axios.post("http://localhost:5000/api/purchases", {
        supplier_name: supplier,
        items: selectedItems,
      });
      alert("Achat créé !");
      onCreated();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("Erreur: " + err.response?.data?.error);
    }
  };

  return (
    <div style={{ position:"fixed", top:0,left:0,right:0,bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center" }}>
      <div style={{ background:"white", padding:20, width:600 }}>
        <h2>Créer un achat</h2>
        <div style={{ marginBottom:10 }}>
          <label>Fournisseur: </label>
          <input value={supplier} onChange={e => setSupplier(e.target.value)} />
        </div>

        {selectedItems.map((item, idx) => (
          <div key={idx} style={{ display:"flex", gap:10, marginBottom:5, alignItems:"center" }}>
            <select value={item.product_id} onChange={e => updateItem(idx,"product_id",Number(e.target.value))}>
              <option value={0}>Sélectionner un article</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx,"quantity",Number(e.target.value))} style={{ width:60 }} />
            <select value={item.store_id} onChange={e => updateItem(idx,"store_id",Number(e.target.value))}>
              <option value={0}>Sélectionner un magasin</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="number" min={0} value={item.unit_price} onChange={e => updateItem(idx,"unit_price",Number(e.target.value))} style={{ width:80 }} />
            <button onClick={() => removeItem(idx)}>Supprimer</button>
          </div>
        ))}

        <button onClick={addItem}>Ajouter un article</button>
        <div>Total global: {totalGlobal}</div>
        <button onClick={handleCreate}>Créer l'achat</button>
        <button onClick={onClose} style={{ marginLeft:10 }}>Fermer</button>
      </div>
    </div>
  );
}
