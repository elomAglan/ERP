// routes/storeRoutes.js
const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Définir les routes pour les magasins
router.get('/', storeController.getAllStores);
router.post('/', storeController.addStore);
router.put('/:id', storeController.updateStore);
router.delete('/:ids', storeController.deleteStores); // Pour supprimer un ou plusieurs

module.exports = router;
