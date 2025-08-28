const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

// GET stock pour un magasin
router.get("/:storeId", inventoryController.getInventory);

// POST ajustement batch
router.post("/adjust/batch", inventoryController.adjustInventoryBatch);

// POST transfert entre magasins
router.post("/transfer", inventoryController.transferStock);

module.exports = router;
