/**
 * @file itemController.js
 * @description Controller pour la gestion des articles (CRUD) avec protection contre les doublons.
 */

const itemController = {
  /**
   * @function getAllItems
   * @description Récupère tous les articles de la base de données.
   */
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

  /**
   * @function addItem
   * @description Ajoute un nouvel article en vérifiant qu'il n'existe pas déjà (même nom + catégorie, insensible à la casse et aux espaces).
   */
  addItem: (req, res) => {
    const db = req.app.locals.db;
    const { name, category, purchasePrice, salePrice } = req.body;

    if (!name || !category || purchasePrice === undefined) {
      return res.status(400).json({ error: "Le nom, la catégorie et le prix d'achat sont obligatoires." });
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
        res.status(201).json({
          id: this.lastID,
          message: "Article ajouté avec succès.",
          item: { id: this.lastID, name, category, purchasePrice, salePrice }
        });
      });
    });
  },

  /**
   * @function updateItem
   * @description Met à jour un article en vérifiant qu'aucun autre article identique n'existe (même règle que pour addItem).
   */
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

  /**
   * @function deleteItem
   * @description Supprime un article de la base de données.
   */
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
