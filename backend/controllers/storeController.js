// controllers/storeController.js
const { dbRun, dbAll, dbGet } = require('../database');

// --- Récupérer tous les magasins ---
exports.getAllStores = async (req, res) => {
    try {
        const stores = await dbAll("SELECT * FROM stores");
        const parsedStores = stores.map(store => ({
            ...store,
            zone: store.zone ? JSON.parse(store.zone) : []
        }));
        res.json(parsedStores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Ajouter un nouveau magasin avec code auto-généré ---
exports.addStore = async (req, res) => {
    const { name, zone } = req.body; // le code est généré automatiquement
    if (!name) {
        return res.status(400).json({ error: 'Le nom est requis.' });
    }

    const zoneArray = Array.isArray(zone) ? zone : [];

    try {
        // Vérifier si un magasin avec le même nom existe
        const existingStore = await dbGet("SELECT id FROM stores WHERE name = ?", [name]);
        if (existingStore) {
            return res.status(409).json({ error: 'Un magasin avec ce nom existe déjà.' });
        }

        // Générer le code automatiquement
        const lastStore = await dbGet("SELECT code FROM stores ORDER BY id DESC LIMIT 1");
        let newCode = "ST-001";
        if (lastStore && lastStore.code) {
            const num = parseInt(lastStore.code.split("-")[1]) + 1;
            newCode = `ST-${num.toString().padStart(3, "0")}`;
        }

        // Insérer le magasin
        const result = await dbRun(
            "INSERT INTO stores (code, name, zone) VALUES (?, ?, ?)",
            [newCode, name, JSON.stringify(zoneArray)]
        );

        const newStore = await dbGet("SELECT * FROM stores WHERE id = ?", [result.id]);
        newStore.zone = JSON.parse(newStore.zone || "[]");

        res.status(201).json(newStore);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Mettre à jour un magasin existant ---
exports.updateStore = async (req, res) => {
    const { id } = req.params;
    const { name, zone } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Le nom est requis.' });
    }

    const zoneArray = Array.isArray(zone) ? zone : [];

    try {
        const currentStore = await dbGet("SELECT * FROM stores WHERE id = ?", [id]);
        if (!currentStore) {
            return res.status(404).json({ error: 'Magasin non trouvé.' });
        }

        const existingConflict = await dbGet(
            "SELECT id FROM stores WHERE name = ? AND id != ?",
            [name, id]
        );
        if (existingConflict) {
            return res.status(409).json({ error: 'Un autre magasin avec ce nom existe déjà.' });
        }

        const result = await dbRun(
            "UPDATE stores SET name = ?, zone = ? WHERE id = ?",
            [name, JSON.stringify(zoneArray), id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Aucune modification effectuée.' });
        }

        const updatedStore = await dbGet("SELECT * FROM stores WHERE id = ?", [id]);
        updatedStore.zone = JSON.parse(updatedStore.zone || "[]");

        res.json(updatedStore);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Supprimer un ou plusieurs magasins ---
exports.deleteStores = async (req, res) => {
    let ids = req.params.ids.split(',').map(Number);
    ids = ids.filter(id => !isNaN(id));

    if (ids.length === 0) {
        return res.status(400).json({ error: 'IDs de magasin invalides fournis.' });
    }

    try {
        const placeholders = ids.map(() => '?').join(',');
        const result = await dbRun(`DELETE FROM stores WHERE id IN (${placeholders})`, ids);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Aucun magasin trouvé avec les IDs fournis.' });
        }

        res.json({ message: `${result.changes} magasin(s) supprimé(s) avec succès.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
