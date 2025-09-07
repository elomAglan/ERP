const { dbRun, dbAll, dbGet,getStock } = require("../database");
const PDFDocument = require("pdfkit");

const salesController = {
  // -------------------- RÉCUPÉRER TOUTES LES VENTES --------------------
  getAll: async (req, res) => {
    try {
      const rows = await dbAll("SELECT * FROM sales ORDER BY date DESC");
      for (let sale of rows) {
        const items = await dbAll(
          `SELECT si.id, si.product_id, si.store_id, si.quantity, si.unit_price, i.name
           FROM sale_items si
           JOIN items i ON si.product_id = i.id
           WHERE si.sale_id = ?`,
          [sale.id]
        );
        sale.items = items || [];
      }
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // -------------------- RÉCUPÉRER UNE VENTE --------------------
  getOne: async (req, res) => {
    try {
      const id = req.params.id;
      const sale = await dbGet("SELECT * FROM sales WHERE id = ?", [id]);
      if (!sale) return res.status(404).json({ error: "Vente non trouvée" });

      const items = await dbAll(
        `SELECT si.id, si.product_id, si.store_id, si.quantity, si.unit_price, i.name
         FROM sale_items si
         JOIN items i ON si.product_id = i.id
         WHERE si.sale_id = ?`,
        [id]
      );
      sale.items = items || [];
      res.json(sale);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // -------------------- CRÉER UNE VENTE --------------------
create: async (req, res) => {
    try {
      const { customer_name, customer_phone, customer_address, items } = req.body;

      // ✅ Vérifications de base
      if (!customer_name || !customer_phone || !customer_address)
        return res.status(400).json({ error: "Nom, téléphone et adresse du client sont obligatoires" });

      if (!items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: "Au moins un article est requis" });

      for (const item of items) {
        if (!item.product_id || !item.store_id) {
          return res.status(400).json({ error: "Chaque article doit avoir un produit et un magasin" });
        }
      }

      // ✅ Vérification du stock AVANT insertion de la vente
      for (const i of items) {
        const totalStock = await getStock(i.product_id, i.store_id);

        if (totalStock < i.quantity) {
          return res.status(400).json({
            error: `Stock insuffisant pour le produit ID ${i.product_id} dans le magasin ID ${i.store_id}. Disponible: ${totalStock}, demandé: ${i.quantity}`
          });
        }
      }

      // ✅ Calcul du montant total
      const total_amount = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

      // ✅ Création de la vente
      const result = await dbRun(
        `INSERT INTO sales (customer_name, customer_phone, customer_address, total_amount, status, date)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [customer_name, customer_phone, customer_address, total_amount, "completed"]
      );

      const sale_id = result.id || result.lastID;
      if (!sale_id) throw new Error("Impossible de récupérer l'ID de la vente");

      // ✅ Ajout des items et mouvements de stock
      for (const i of items) {
        await dbRun(
          "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, store_id) VALUES (?, ?, ?, ?, ?)",
          [sale_id, i.product_id, i.quantity, i.unit_price, i.store_id]
        );

        // Mouvement sortant (OUT)
        await dbRun(
          `INSERT INTO stock_movements (product_id, store_id, type, quantity, reference)
           VALUES (?, ?, 'OUT', ?, ?)`,
          [i.product_id, i.store_id, i.quantity, `SALE-${sale_id}`]
        );
      }

      // ✅ Récupérer la vente complète avec items
      const createdSale = await dbGet("SELECT * FROM sales WHERE id = ?", [sale_id]);
      const saleItems = await dbAll(
        `SELECT si.id, si.product_id, si.store_id, si.quantity, si.unit_price, i.name
         FROM sale_items si
         JOIN items i ON si.product_id = i.id
         WHERE si.sale_id = ?`,
        [sale_id]
      );
      createdSale.items = saleItems || [];

      res.status(201).json({ message: "Vente créée avec succès", sale: createdSale });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur lors de la création de la vente" });
    }
  },

  // -------------------- RETOUR D’ARTICLES --------------------
  returnSale: async (req, res) => {
    try {
      const sale_id = req.params.id;
      const { returns } = req.body; // tableau [{ item_id, quantity }]
      if (!returns || !Array.isArray(returns) || returns.length === 0)
        return res.status(400).json({ error: "Aucun retour renseigné" });

      const sale = await dbGet("SELECT * FROM sales WHERE id = ?", [sale_id]);
      if (!sale) return res.status(404).json({ error: "Vente non trouvée" });

      for (const r of returns) {
        const saleItem = await dbGet(
          "SELECT * FROM sale_items WHERE id = ? AND sale_id = ?",
          [r.item_id, sale_id]
        );
        if (!saleItem) continue;
        if (r.quantity > saleItem.quantity)
          return res.status(400).json({ error: `Quantité trop grande pour l'article ID ${r.item_id}` });

        await dbRun("UPDATE sale_items SET quantity = quantity - ? WHERE id = ?", [r.quantity, r.item_id]);
        await dbRun(
          `INSERT INTO stock_movements (product_id, store_id, type, quantity, reference)
           VALUES (?, ?, 'IN', ?, ?)`,
          [saleItem.product_id, saleItem.store_id, r.quantity, `RETURN-${sale_id}`]
        );
      }

      const updatedSale = await dbGet("SELECT * FROM sales WHERE id = ?", [sale_id]);
      const updatedItems = await dbAll(
        `SELECT si.id, si.product_id, si.store_id, si.quantity, si.unit_price, i.name
         FROM sale_items si
         JOIN items i ON si.product_id = i.id
         WHERE si.sale_id = ?`,
        [sale_id]
      );
      updatedSale.items = updatedItems || [];

      res.json({ message: "Retour(s) enregistré(s)", sale: updatedSale });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur retour vente" });
    }
  },

  // -------------------- METTRE À JOUR LE STATUT D'UNE VENTE --------------------
  updateStatus: async (req, res) => {
    try {
      const id = req.params.id;
      const { status } = req.body;
      const result = await dbRun("UPDATE sales SET status = ? WHERE id = ?", [status || "completed", id]);
      if (result.changes === 0) return res.status(404).json({ error: "Vente non trouvée" });
      res.json({ message: "Statut de la vente mis à jour" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // -------------------- GÉNÉRER PDF REÇU --------------------
  generateReceiptPDF: async (req, res) => {
  try {
    const id = req.params.id;
    const sale = await dbGet("SELECT * FROM sales WHERE id = ?", [id]);
    if (!sale) {
      return res.status(404).json({ error: "Vente non trouvée" });
    }

    const items = await dbAll(
      `SELECT si.id, si.quantity, si.unit_price, i.name
       FROM sale_items si
       JOIN items i ON si.product_id = i.id
       WHERE si.sale_id = ?`,
      [id]
    );

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=RECU_${id}.pdf`);
    doc.pipe(res);

    // --- Variables de style et de mise en page ---
    const primaryColor = '#007BFF';
    const accentColor = '#6c757d';
    const footerHeight = 70; // Hauteur estimée du pied de page

    // --- En-tête du reçu (Logo et titre) ---
    doc
      .fillColor(primaryColor)
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('Nom de Votre Entreprise', 110, 60);

    doc.moveDown(0.5);
    doc
      .fillColor(accentColor)
      .fontSize(10)
      .font('Helvetica')
      .text(`Facture / Reçu #${id}`, { align: 'right' });

    doc.text(`Date: ${new Date(sale.date).toLocaleDateString('fr-FR')}`, { align: 'right' });
    doc.moveDown();

    doc.strokeColor(primaryColor).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // --- Informations Client et Entreprise ---
    const customerInfoY = doc.y;
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Client', 50, customerInfoY);

    doc
      .fillColor(accentColor)
      .fontSize(12)
      .font('Helvetica')
      .text(`Nom: ${sale.customer_name || 'N/A'}`, 50, customerInfoY + 20)
      .text(`Téléphone: ${sale.customer_phone || 'N/A'}`, 50, customerInfoY + 35)
      .text(`Adresse: ${sale.customer_address || 'N/A'}`, 50, customerInfoY + 50);

    const companyInfoY = doc.y;
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Émetteur', 350, customerInfoY);

    doc
      .fillColor(accentColor)
      .fontSize(12)
      .font('Helvetica')
      .text('Nom de Votre Entreprise', 350, customerInfoY + 20)
      .text('Votre Adresse', 350, customerInfoY + 35)
      .text('Votre Téléphone', 350, customerInfoY + 50)
      .text('Votre Site Web', 350, customerInfoY + 65);

    doc.y = Math.max(doc.y, customerInfoY + 80);
    doc.moveDown(1.5);

    doc.strokeColor(primaryColor).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // --- Tableau des articles ---
    const tableTop = doc.y;
    const itemX = 60;
    const qtyX = 300;
    const priceX = 400;
    const totalX = 500;

    doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12);
    doc.text('Produit', itemX, tableTop);
    doc.text('Qté', qtyX, tableTop);
    doc.text('Prix Unitaire', priceX, tableTop);
    doc.text('Total', totalX, tableTop, { align: 'right' });
    doc.moveDown();

    doc.fillColor('#000000').font('Helvetica');
    let totalAmount = 0;
    let yPos = doc.y;

    items.forEach(item => {
      const lineTotal = item.quantity * item.unit_price;
      totalAmount += lineTotal;

      // Vérifier si une nouvelle page est nécessaire avant d'ajouter l'article
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

    // --- Montant total ---
    doc.strokeColor(primaryColor).moveTo(300, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(18).font('Helvetica-Bold');
    doc.text(`Total:`, 300, doc.y, { continued: true });
    doc.fillColor(primaryColor).text(`${totalAmount.toFixed(2)} XOF`, { align: 'right' });

    doc.moveDown(3);

    // --- Pied de page (Footer) ---
    // Vérifier s'il y a assez d'espace pour le pied de page, sinon ajouter une nouvelle page
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
      .text(`Merci de votre achat ! N'hésitez pas à nous contacter pour toute question.`, 50, footerY + 10, { align: 'center', width: 500 });

    doc.fontSize(8).text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 50, footerY + 25, { align: 'center', width: 500 });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la génération du PDF" });
  }
},
};

module.exports = salesController;
