// controllers/inventoryController.js
const { dbAll, dbRun, dbGet } = require("../database");

// --- Récupérer le stock actuel pour un magasin ---
async function getInventory(req, res) {
  const storeId = Number(req.params.storeId);
  if (!storeId) return res.status(400).json({ error: "storeId requis" });

  try {
    // On ne sélectionne que les produits ayant des mouvements pour ce magasin
    const stock = await dbAll(
      `
      SELECT 
        i.id AS product_id,
        i.name,
        SUM(
          CASE 
            WHEN sm.type IN ('IN','ADJUST','TRANSFER_IN') THEN sm.quantity
            WHEN sm.type IN ('OUT','TRANSFER_OUT') THEN -sm.quantity
            ELSE 0
          END
        ) AS current_stock
      FROM stock_movements sm
      INNER JOIN items i ON sm.product_id = i.id
      WHERE sm.store_id = ?
      GROUP BY i.id, i.name
      HAVING current_stock != 0
      ORDER BY i.name ASC
    `,
      [storeId]
    );

    res.json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// --- Ajustement batch du stock après inventaire physique ---
async function adjustInventoryBatch(req, res) {
  const { adjustments } = req.body;
  if (!Array.isArray(adjustments))
    return res
      .status(400)
      .json({ error: "adjustments doit être un tableau" });

  try {
    for (let adj of adjustments) {
      const { product_id, store_id, counted_qty, inventory_reference } = adj;

      // Récupérer le stock actuel
      const stockRow = await dbGet(
        `
        SELECT 
          COALESCE(SUM(CASE WHEN type IN ('IN','ADJUST','TRANSFER_IN') THEN quantity ELSE 0 END),0)
          - COALESCE(SUM(CASE WHEN type IN ('OUT','TRANSFER_OUT') THEN quantity ELSE 0 END),0) AS current_stock
        FROM stock_movements
        WHERE store_id=? AND product_id=?
      `,
        [store_id, product_id]
      );

      const currentStock = stockRow?.current_stock || 0;
      const delta = counted_qty - currentStock;

      if (delta !== 0) {
        await dbRun(
          "INSERT INTO stock_movements (product_id, store_id, type, quantity, reference) VALUES (?,?,?,?,?)",
          [product_id, store_id, "ADJUST", delta, inventory_reference]
        );
      }
    }

    res.json({ message: "Inventaire ajusté" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// --- Transfert de stock entre magasins ---
async function transferStock(req, res) {
  const { transfers } = req.body;
  if (!Array.isArray(transfers) || transfers.length === 0) {
    return res
      .status(400)
      .json({ error: "transfers doit être un tableau non vide" });
  }

  try {
    for (let t of transfers) {
      const { product_id, from_store_id, to_store_id, quantity } = t;

      if (!product_id || !from_store_id || !to_store_id || !quantity) {
        return res
          .status(400)
          .json({ error: "Champs manquants dans un transfert" });
      }

      if (from_store_id === to_store_id) {
        return res.status(400).json({
          error: "Le magasin source et destination ne peuvent pas être identiques",
        });
      }

      // Vérifier stock disponible dans le magasin source
      const stockRow = await dbGet(
        `
        SELECT 
          COALESCE(SUM(CASE WHEN type IN ('IN','ADJUST','TRANSFER_IN') THEN quantity ELSE 0 END),0)
          - COALESCE(SUM(CASE WHEN type IN ('OUT','TRANSFER_OUT') THEN quantity ELSE 0 END),0) AS current_stock
        FROM stock_movements
        WHERE store_id=? AND product_id=?
      `,
        [from_store_id, product_id]
      );

      const currentStock = stockRow?.current_stock || 0;
      if (currentStock < quantity) {
        return res.status(400).json({
          error: `Stock insuffisant pour le produit ${product_id} dans le magasin ${from_store_id}`,
        });
      }

      const reference = `TRANS-${Date.now()}`;

      // Mvt sortant
      await dbRun(
        "INSERT INTO stock_movements (product_id, store_id, type, quantity, reference) VALUES (?,?,?,?,?)",
        [product_id, from_store_id, "TRANSFER_OUT", quantity, reference]
      );

      // Mvt entrant
      await dbRun(
        "INSERT INTO stock_movements (product_id, store_id, type, quantity, reference) VALUES (?,?,?,?,?)",
        [product_id, to_store_id, "TRANSFER_IN", quantity, reference]
      );
    }

    res.json({ message: "Transfert(s) effectué(s)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { getInventory, adjustInventoryBatch, transferStock };
