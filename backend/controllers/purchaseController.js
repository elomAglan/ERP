const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { dbRun, dbAll, dbGet } = require("../database");

// --- Configuration multer pour uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// --- Controller ---
const purchaseController = {
  // Liste tous les achats
  getAll: async (req, res) => {
    try {
      const rows = await dbAll("SELECT * FROM purchases ORDER BY date DESC");
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Détails d’un achat avec ses items
  getOne: async (req, res) => {
    try {
      const id = req.params.id;
      const purchase = await dbGet("SELECT * FROM purchases WHERE id = ?", [id]);
      if (!purchase) return res.status(404).json({ error: "Achat non trouvé" });

      const items = await dbAll("SELECT * FROM purchase_items WHERE purchase_id = ?", [id]);
      purchase.items = items;
      res.json(purchase);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Créer un achat avec ses items
  create: async (req, res) => {
    try {
      const { supplier_name, items } = req.body;
      if (!supplier_name) return res.status(400).json({ error: "Nom du fournisseur requis" });
      if (!items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: "Items requis" });

      const total_amount = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
      const result = await dbRun(
        "INSERT INTO purchases (supplier_name, total_amount, status) VALUES (?, ?, 'pending')",
        [supplier_name, total_amount]
      );
      const purchase_id = result.id;

      const stmtPromises = items.map(i =>
        dbRun(
          "INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, store_id, received_quantity) VALUES (?, ?, ?, ?, ?, 0)",
          [purchase_id, i.product_id, i.quantity, i.unit_price, i.store_id]
        )
      );
      await Promise.all(stmtPromises);

      res.status(201).json({ message: "Achat créé", purchase_id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Mise à jour du statut d’un achat
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { status } = req.body;
      const result = await dbRun(
        "UPDATE purchases SET status = ?, date = CURRENT_TIMESTAMP WHERE id = ?",
        [status || "pending", id]
      );
      if (result.changes === 0) return res.status(404).json({ error: "Achat non trouvé" });
      res.json({ message: "Achat mis à jour" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Supprimer un achat et ses items
  delete: async (req, res) => {
    try {
      const id = req.params.id;
      await dbRun("DELETE FROM purchase_items WHERE purchase_id = ?", [id]);
      await dbRun("DELETE FROM purchases WHERE id = ?", [id]);
      res.json({ message: "Achat supprimé" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Réception d’articles (partielle ou complète)
  receiveItems: async (req, res) => {
    try {
      const { items } = req.body; // [{ purchase_item_id, quantity_received }]
      if (!Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: "Items requis" });

      // Récupérer l'ID de l'achat depuis le premier item
      const firstItem = await dbGet(
        "SELECT purchase_id FROM purchase_items WHERE id = ?",
        [items[0].purchase_item_id]
      );
      if (!firstItem) return res.status(404).json({ error: "Article non trouvé" });

      const purchaseId = firstItem.purchase_id;

      // Traiter chaque item reçu
      for (const i of items) {
        const row = await dbGet("SELECT * FROM purchase_items WHERE id = ?", [i.purchase_item_id]);
        if (!row)
          return res.status(404).json({ error: `Article ${i.purchase_item_id} non trouvé` });

        const newReceived = row.received_quantity + i.quantity_received;
        if (newReceived > row.quantity) {
          return res.status(400).json({
            error: `Impossible de recevoir plus que commandé pour l'article ${row.id}`,
          });
        }

        // Mettre à jour la quantité reçue
        await dbRun("UPDATE purchase_items SET received_quantity = ? WHERE id = ?", [
          newReceived,
          i.purchase_item_id,
        ]);

        // Ajouter un mouvement de stock
        await dbRun(
          "INSERT INTO stock_movements (product_id, store_id, type, quantity, reference) VALUES (?, ?, 'IN', ?, ?)",
          [row.product_id, row.store_id, i.quantity_received, `RECEPTION-PURCHASE-${row.purchase_id}`]
        );
      }

      // Vérifier le statut global de l'achat
      const remaining = await dbAll(
        "SELECT * FROM purchase_items WHERE purchase_id = ? AND received_quantity < quantity",
        [purchaseId]
      );
      const status = remaining.length === 0 ? "received" : "partial";

      await dbRun("UPDATE purchases SET status = ? WHERE id = ?", [status, purchaseId]);

      res.json({ message: "Réception enregistrée", status });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // Middleware upload pour fichiers (BC, facture, etc.)
  uploadFile: upload.single("file"),
};

module.exports = purchaseController;
