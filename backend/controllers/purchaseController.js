// controllers/purchaseController.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const { dbRun, dbAll, dbGet } = require("../database");

// --- Multer configuration pour upload fichiers ---
const uploadPath = path.join(__dirname, "../uploads/receipts");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// --- Controller principal ---
const purchaseController = {
  // -------------------- ACHATS --------------------
  getAll: async (req, res) => {
    try {
      const rows = await dbAll("SELECT * FROM purchases ORDER BY date DESC");
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // -------------------- ACHAT UNIQUE AVEC NOM PRODUITS --------------------
  getOne: async (req, res) => {
    try {
      const id = req.params.id;
      const purchase = await dbGet("SELECT * FROM purchases WHERE id = ?", [id]);
      if (!purchase) return res.status(404).json({ error: "Achat non trouvé" });

      // Récupérer les items avec le nom du produit
      const items = await dbAll(
        `SELECT pi.id, pi.quantity, pi.received_quantity, i.name
         FROM purchase_items pi
         JOIN items i ON pi.product_id = i.id
         WHERE pi.purchase_id = ?`,
        [id]
      );

      purchase.items = items;
      res.json(purchase);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const { supplier_name, items } = req.body;
      if (!supplier_name) return res.status(400).json({ error: "Nom du fournisseur requis" });
      if (!items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: "Items requis" });

      const total_amount = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
      const result = await dbRun(
        "INSERT INTO purchases (supplier_name, total_amount) VALUES (?, ?)",
        [supplier_name, total_amount]
      );
      const purchase_id = result.id;

      await Promise.all(items.map(i =>
        dbRun(
          "INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, store_id, received_quantity) VALUES (?, ?, ?, ?, ?, 0)",
          [purchase_id, i.product_id, i.quantity, i.unit_price, i.store_id]
        )
      ));

      res.status(201).json({ message: "Achat créé", purchase_id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

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

  // -------------------- RÉCEPTION --------------------
  receiveItems: async (req, res) => {
    try {
      const { items } = req.body; // [{ purchase_item_id, quantity_received }]
      if (!Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: "Items requis" });

      const firstItem = await dbGet(
        "SELECT purchase_id FROM purchase_items WHERE id = ?",
        [items[0].purchase_item_id]
      );
      if (!firstItem) return res.status(404).json({ error: "Article non trouvé" });

      const purchaseId = firstItem.purchase_id;

      for (const i of items) {
        const row = await dbGet("SELECT * FROM purchase_items WHERE id = ?", [i.purchase_item_id]);
        if (!row) return res.status(404).json({ error: `Article ${i.purchase_item_id} non trouvé` });

        const newReceived = row.received_quantity + i.quantity_received;
        if (newReceived > row.quantity)
          return res.status(400).json({ error: `Impossible de recevoir plus que commandé pour l'article ${row.id}` });

        await dbRun("UPDATE purchase_items SET received_quantity = ? WHERE id = ?", [newReceived, i.purchase_item_id]);

        await dbRun(
          "INSERT INTO stock_movements (product_id, store_id, type, quantity, reference) VALUES (?, ?, 'IN', ?, ?)",
          [row.product_id, row.store_id, i.quantity_received, `RECEPTION-PURCHASE-${row.purchase_id}`]
        );
      }

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

  // -------------------- PDF BON DE COMMANDE --------------------

generatePDF: async (req, res) => {
  try {
    const id = req.params.id;
    const purchase = await dbGet("SELECT * FROM purchases WHERE id = ?", [id]);
    if (!purchase) {
      return res.status(404).json({ error: "Achat non trouvé" });
    }

    const items = await dbAll(
      `SELECT pi.id, pi.quantity, pi.unit_price, i.name
       FROM purchase_items pi
       JOIN items i ON pi.product_id = i.id
       WHERE pi.purchase_id = ?`,
      [id]
    );

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=BON_DE_COMMANDE_${id}.pdf`);
    doc.pipe(res);

    // --- Variables de style et de mise en page ---
    const primaryColor = '#0056b3'; // Bleu foncé
    const accentColor = '#343a40';  // Noir-gris

    // --- En-tête du document ---
    doc
      .fillColor(primaryColor)
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('BON DE COMMANDE', { align: 'center' });

    doc.moveDown(0.5);
    doc
      .fillColor(accentColor)
      .fontSize(10)
      .font('Helvetica')
      .text(`Commande #${id}`, { align: 'center' });
    
    doc.moveDown(2);

    // Ligne de séparation
    doc.strokeColor(primaryColor).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // --- Informations Fournisseur et Date ---
    const supplierInfoY = doc.y;
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Fournisseur', 50, supplierInfoY);
      
    doc
      .fillColor(accentColor)
      .fontSize(12)
      .font('Helvetica')
      .text(`Nom: ${purchase.supplier_name || 'N/A'}`, 50, supplierInfoY + 20);

    const dateInfoY = doc.y;
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Date de la commande', 350, supplierInfoY);

    doc
      .fillColor(accentColor)
      .fontSize(12)
      .font('Helvetica')
      .text(`${new Date(purchase.date).toLocaleDateString('fr-FR')}`, 350, supplierInfoY + 20);

    doc.y = Math.max(doc.y, supplierInfoY + 50);
    doc.moveDown(1.5);
    
    doc.strokeColor(primaryColor).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // --- Tableau des articles ---
    const tableTop = doc.y;
    const itemX = 60;
    const qtyX = 300;
    const priceX = 400;
    const totalX = 500;
    
    // Entête du tableau
    doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12);
    doc.text('Produit', itemX, tableTop);
    doc.text('Qté', qtyX, tableTop);
    doc.text('Prix Unitaire', priceX, tableTop);
    doc.text('Total', totalX, tableTop, { align: 'right' });
    doc.moveDown();

    doc.fillColor('#000000').font('Helvetica');
    let totalAmount = 0;
    let yPos = doc.y;
    const footerHeight = 70;

    items.forEach(item => {
      const lineTotal = item.quantity * item.unit_price;
      totalAmount += lineTotal;

      if (yPos + 20 > doc.page.height - doc.page.margins.bottom - footerHeight) {
        doc.addPage();
        yPos = doc.page.margins.top;
      }

      doc.text(item.name, itemX, yPos);
      doc.text(item.quantity.toString(), qtyX, yPos);
      doc.text(`${item.unit_price.toFixed(2)} XOF`, priceX, yPos);
      doc.text(`${lineTotal.toFixed(2)} XOF`, totalX, yPos, { align: 'right' });
      yPos += 20;
    });

    doc.y = yPos;
    doc.moveDown(1);
    
    // Ligne de séparation pour le total
    doc.strokeColor(primaryColor).moveTo(300, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // --- Montant total ---
    doc.fontSize(18).font('Helvetica-Bold');
    doc.text(`Montant total:`, 300, doc.y, { continued: true });
    doc.fillColor(primaryColor).text(`${totalAmount.toFixed(2)} XOF`, { align: 'right' });

    doc.moveDown(3);

    // --- Pied de page (Footer) ---
    const spaceNeededForFooter = footerHeight + 10;
    if (doc.y + spaceNeededForFooter > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
    }

    const footerY = doc.y + 10;
    doc.strokeColor(accentColor).moveTo(50, footerY).lineTo(550, footerY).stroke();
    doc
      .fontSize(10)
      .fillColor(accentColor)
      .font('Helvetica-Oblique')
      .text(`Ce bon de commande est généré automatiquement.`, 50, footerY + 10, { align: 'center', width: 500 });
    
    doc.fontSize(8).text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 50, footerY + 25, { align: 'center', width: 500 });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la génération du PDF" });
  }
},
  // -------------------- UPLOAD RÉÇU --------------------
  uploadReceipt: [
    upload.single("file"),
    async (req, res) => {
      try {
        const id = req.params.id;
        if (!req.file) return res.status(400).json({ error: "Fichier requis" });

        const receiptUrl = `/uploads/receipts/${req.file.filename}`;
        await dbRun("UPDATE purchases SET receipt_url = ? WHERE id = ?", [receiptUrl, id]);

        res.json({
          message: "Reçu uploadé avec succès",
          filename: req.file.filename,
          url: receiptUrl,
        });
      } catch (err) {
        console.error("Erreur upload reçu :", err);
        res.status(500).json({ error: "Erreur upload reçu", stack: err.stack });
      }
    }
  ],
};

module.exports = purchaseController;
