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
                salePrice REAL
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
