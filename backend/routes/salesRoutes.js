const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");

// Récupérer toutes les ventes
router.get("/", salesController.getAll);

// Récupérer une vente
router.get("/:id", salesController.getOne);

// Créer une vente
router.post("/", salesController.create);

// Retour d’un article
router.post("/:id/return", salesController.returnSale);

// Générer PDF reçu
router.get("/:id/receipt", salesController.generateReceiptPDF);

// Mettre à jour statut
router.patch("/:id/status", salesController.updateStatus);

module.exports = router;
