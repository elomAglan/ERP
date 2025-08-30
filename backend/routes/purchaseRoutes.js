const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");
const { dbRun } = require("../database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- Multer configuration ---
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

// --- Upload reçu ---
router.put("/:id/receipt", upload.single("file"), async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.file) return res.status(400).json({ error: "Fichier requis" });

    await dbRun("UPDATE purchases SET receipt_url = ? WHERE id = ?", [
      `/uploads/receipts/${req.file.filename}`,
      id,
    ]);

    res.json({ message: "Reçu uploadé", filename: req.file.filename });
  } catch (err) {
    console.error("Erreur upload reçu :", err);
    res.status(500).json({ error: "Erreur upload reçu", stack: err.stack });
  }
});

// --- Réception d'articles ---
router.put("/:id/receive", purchaseController.receiveItems);

// --- PDF ---
router.get("/:id/pdf", purchaseController.generatePDF);

// --- Routes achats ---
router.get("/", purchaseController.getAll);
router.get("/:id", purchaseController.getOne);
router.post("/", purchaseController.create);
router.put("/:id", purchaseController.update);
router.delete("/:id", purchaseController.delete);

module.exports = router;
