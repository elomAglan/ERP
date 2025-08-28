/**
 * @file itemController.js
 * @description Controller pour la gestion des articles (CRUD) avec protection contre les doublons et stock initial.
 */

const itemController = {
  // --- Récupérer tous les articles ---
  getAllItems: (req, res) => {
    const db = req.app.locals.db;
    db.all("SELECT * FROM items", [], (err, rows) => {
      if (err) {
        console.error("Erreur lors de la récupération des articles:", err.message);
        return res.status(500).json({ error: "Erreur serveur. Impossible de récupérer les articles." });
      }
      res.json(rows);
    });
  },

  // --- Ajouter un article avec stock initial ---
  addItem: (req, res) => {
    const db = req.app.locals.db;
    const { name, category, purchasePrice, salePrice, initialStock = 0, storeId } = req.body;

    if (!name || !category || purchasePrice === undefined) {
      return res.status(400).json({ error: "Le nom, la catégorie et le prix d'achat sont obligatoires." });
    }

    if (initialStock < 0) {
      return res.status(400).json({ error: "Le stock initial ne peut pas être négatif." });
    }

    const sqlCheck = `
      SELECT * FROM items
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
        AND LOWER(TRIM(category)) = LOWER(TRIM(?))
    `;

    db.get(sqlCheck, [name, category], (err, row) => {
      if (err) {
        console.error("Erreur lors de la vérification de l'article:", err.message);
        return res.status(500).json({ error: "Erreur serveur. Impossible de vérifier l'article." });
      }

      if (row) {
        return res.status(409).json({ error: "Un article avec ce nom et cette catégorie existe déjà." });
      }

      const sqlInsert = `
        INSERT INTO items (name, category, purchasePrice, salePrice)
        VALUES (?, ?, ?, ?)
      `;
      db.run(sqlInsert, [name, category, purchasePrice, salePrice || null], function(err) {
        if (err) {
          console.error("Erreur lors de l'ajout de l'article:", err.message);
          return res.status(500).json({ error: "Erreur serveur. Impossible d'ajouter l'article." });
        }

        const itemId = this.lastID;

        // --- Ajouter le stock initial si > 0 et storeId fourni ---
        if (initialStock > 0 && storeId) {
          const sqlStock = `
            INSERT INTO stock_movements (product_id, store_id, type, quantity, reference)
            VALUES (?, ?, 'IN', ?, 'INITIAL_STOCK')
          `;
          db.run(sqlStock, [itemId, storeId, initialStock], (err2) => {
            if (err2) {
              console.error("Erreur lors de l'ajout du stock initial:", err2.message);
              return res.status(500).json({ error: "Article ajouté mais impossible d'enregistrer le stock initial." });
            }
            res.status(201).json({
              id: itemId,
              message: "Article ajouté avec succès avec stock initial.",
              item: { id: itemId, name, category, purchasePrice, salePrice, initialStock, storeId }
            });
          });
        } else {
          res.status(201).json({
            id: itemId,
            message: "Article ajouté avec succès.",
            item: { id: itemId, name, category, purchasePrice, salePrice }
          });
        }
      });
    });
  },

  // --- Update et Delete restent identiques ---
  updateItem: (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { name, category, purchasePrice, salePrice } = req.body;

    if (!name || !category || purchasePrice === undefined) {
      return res.status(400).json({ error: "Le nom, la catégorie et le prix d'achat sont obligatoires." });
    }

    const sqlCheck = `
      SELECT * FROM items
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
        AND LOWER(TRIM(category)) = LOWER(TRIM(?))
        AND id != ?
    `;

    db.get(sqlCheck, [name, category, id], (err, row) => {
      if (err) {
        console.error("Erreur lors de la vérification de l'article:", err.message);
        return res.status(500).json({ error: "Erreur serveur. Impossible de vérifier l'article." });
      }

      if (row) {
        return res.status(409).json({ error: "Un autre article avec ce nom et cette catégorie existe déjà." });
      }

      const sqlUpdate = `
        UPDATE items
        SET name = ?, category = ?, purchasePrice = ?, salePrice = ?
        WHERE id = ?
      `;
      db.run(sqlUpdate, [name, category, purchasePrice, salePrice || null, id], function(err) {
        if (err) {
          console.error("Erreur lors de la mise à jour de l'article:", err.message);
          return res.status(500).json({ error: "Erreur serveur. Impossible de mettre à jour l'article." });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: `Article avec l'ID ${id} non trouvé.` });
        }
        res.json({ message: "Article mis à jour avec succès." });
      });
    });
  },

  deleteItem: (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;

    db.run("DELETE FROM items WHERE id = ?", id, function(err) {
      if (err) {
        console.error("Erreur lors de la suppression de l'article:", err.message);
        return res.status(500).json({ error: "Erreur serveur. Impossible de supprimer l'article." });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: `Article avec l'ID ${id} non trouvé.` });
      }
      res.json({ message: "Article supprimé avec succès." });
    });
  }
};

module.exports = itemController;
