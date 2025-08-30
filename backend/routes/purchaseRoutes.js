const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");

// --- Réception partielle ou complète d'articles ---
// ⚠️ Placé AVANT les routes avec :id pour éviter les conflits
router.put("/:id/receive", purchaseController.receiveItems);

// --- Routes achats ---
router.get("/", purchaseController.getAll);          // Liste tous les achats
router.get("/:id", purchaseController.getOne);       // Détails d’un achat
router.post("/", purchaseController.create);         // Créer un achat
router.put("/:id", purchaseController.update);       // Mettre à jour un achat
router.delete("/:id", purchaseController.delete);    // Supprimer un achat

// --- Exemple upload fichier ---
router.post("/:id/upload", purchaseController.uploadFile, (req, res) => {
  res.json({ message: "Fichier uploadé", filename: req.file.filename });
});

module.exports = router;
