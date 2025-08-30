// database.js
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

// Chemin de la base
const dbPath = path.resolve(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Erreur ouverture DB:", err.message);
    else console.log("Connecté à SQLite:", dbPath);
});

// --- Fonctions utilitaires avec Promises ---
const dbRun = (query, params = []) =>
    new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });

const dbAll = (query, params = []) =>
    new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

const dbGet = (query, params = []) =>
    new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

// --- Migration table users (ajout username si absent) ---
async function migrateUsersTable() {
    try {
        const columns = await dbAll("PRAGMA table_info(users)");
        const names = columns.map(c => c.name);
        if (!names.includes("username")) {
            await dbRun("ALTER TABLE users ADD COLUMN username TEXT");
            console.log("Colonne 'username' ajoutée à users");
        }
    } catch (err) {
        console.error("Migration users:", err.message);
    }
}

// --- Migration table purchases (ajout status, bc_number, receipt_url si absents) ---
async function migratePurchasesTable() {
    try {
        const columns = await dbAll("PRAGMA table_info(purchases)");
        const names = columns.map(c => c.name);

        if (!names.includes("status")) {
            await dbRun("ALTER TABLE purchases ADD COLUMN status TEXT DEFAULT 'pending'");
            console.log("Colonne 'status' ajoutée à purchases");
        }
        if (!names.includes("bc_number")) {
            await dbRun("ALTER TABLE purchases ADD COLUMN bc_number TEXT");
            console.log("Colonne 'bc_number' ajoutée à purchases");
        }
        if (!names.includes("receipt_url")) {
            await dbRun("ALTER TABLE purchases ADD COLUMN receipt_url TEXT");
            console.log("Colonne 'receipt_url' ajoutée à purchases");
        }
    } catch (err) {
        console.error("Migration purchases:", err.message);
    }
}

// --- Création des tables ---
async function initializeDatabase() {
    try {
        // Table users
        await dbRun(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT NOT NULL
            )
        `);
        console.log("Table 'users' prête.");
        await migrateUsersTable();

        // Table items (produits)
        await dbRun(`
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                category TEXT NOT NULL,
                purchasePrice REAL NOT NULL,
                salePrice REAL,
                deleted_at TIMESTAMP
            )
        `);
        console.log("Table 'items' prête.");

        // Table stores (magasins)
        await dbRun(`
            CREATE TABLE IF NOT EXISTS stores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT UNIQUE,
                name TEXT NOT NULL UNIQUE,
                zone TEXT
            )
        `);
        console.log("Table 'stores' prête.");

        // Table stock_movements (mouvements de stock)
        await dbRun(`
            CREATE TABLE IF NOT EXISTS stock_movements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                store_id INTEGER NOT NULL,
                zone TEXT,
                type TEXT NOT NULL, -- 'IN','OUT','ADJUST','TRANSFER_IN','TRANSFER_OUT'
                quantity REAL NOT NULL,
                reference TEXT,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(product_id) REFERENCES items(id),
                FOREIGN KEY(store_id) REFERENCES stores(id)
            )
        `);
        console.log("Table 'stock_movements' prête.");

        // Table purchases (achats)
        await dbRun(`
            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                supplier_name TEXT NOT NULL,
                total_amount REAL NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table 'purchases' prête.");
        await migratePurchasesTable();

        // Table purchase_items (articles d'un achat)
        await dbRun(`
            CREATE TABLE IF NOT EXISTS purchase_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                purchase_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity REAL NOT NULL,
                unit_price REAL NOT NULL,
                store_id INTEGER NOT NULL,
                FOREIGN KEY(purchase_id) REFERENCES purchases(id),
                FOREIGN KEY(product_id) REFERENCES items(id),
                FOREIGN KEY(store_id) REFERENCES stores(id)
            )
        `);
        console.log("Table 'purchase_items' prête.");

    } catch (err) {
        console.error("Erreur initialisation DB:", err.message);
    }
}

// --- Migration pour ajouter received_quantity si absente ---
async function migratePurchaseItems() {
    try {
        // Vérifie la structure de la table
        const columns = await dbAll("PRAGMA table_info(purchase_items)");
        const names = columns.map(c => c.name);

        // Si la colonne n'existe pas, on l'ajoute
        if (!names.includes("received_quantity")) {
            await dbRun("ALTER TABLE purchase_items ADD COLUMN received_quantity REAL DEFAULT 0");
            console.log("✅ Colonne 'received_quantity' ajoutée à purchase_items");
        } else {
            console.log("Colonne 'received_quantity' déjà présente dans purchase_items");
        }
    } catch (err) {
        console.error("❌ Migration purchase_items:", err.message);
    }
}

// --- Appel après création de la table purchase_items ---
async function initializeDatabase() {
    try {
        // ... création des autres tables ...

        // Table purchase_items
        await dbRun(`
            CREATE TABLE IF NOT EXISTS purchase_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                purchase_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity REAL NOT NULL,
                unit_price REAL NOT NULL,
                store_id INTEGER NOT NULL,
                FOREIGN KEY(purchase_id) REFERENCES purchases(id),
                FOREIGN KEY(product_id) REFERENCES items(id),
                FOREIGN KEY(store_id) REFERENCES stores(id)
            )
        `);
        console.log("Table 'purchase_items' prête.");

        // ✅ Migration pour received_quantity
        await migratePurchaseItems();

    } catch (err) {
        console.error("Erreur initialisation DB:", err.message);
    }
}


// Lancer l'initialisation
initializeDatabase();

// --- Export ---
module.exports = {
    dbRun,
    dbAll,
    dbGet,
    db
};
