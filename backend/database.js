// database.js
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.resolve(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erreur lors de l'ouverture de la base de données:", err.message);
    } else {
        console.log("Connecté à SQLite:", dbPath);
    }
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

// --- Fonction de migration ---
async function migrateUsersTable() {
    try {
        const columns = await dbAll("PRAGMA table_info(users)");
        const columnNames = columns.map(col => col.name);
        if (!columnNames.includes("username")) {
            await dbRun("ALTER TABLE users ADD COLUMN username TEXT");
            console.log("Colonne 'username' ajoutée à la table users.");
        }
    } catch (err) {
        console.error("Erreur migration table users:", err.message);
    }
}

// --- Initialisation des tables et données ---
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

        // Ajout utilisateur par défaut
        const defaultUser = "user";
        const defaultPass = await bcrypt.hash("1234", 10);
        const existingUser = await dbGet("SELECT * FROM users WHERE username = ?", [defaultUser]);
        if (!existingUser) {
            await dbRun("INSERT INTO users (username, password) VALUES (?, ?)", [defaultUser, defaultPass]);
            console.log("Utilisateur par défaut ajouté :", defaultUser);
        }

        // Table items
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

        const itemsCount = await dbGet("SELECT COUNT(*) AS count FROM items");
        if (itemsCount.count === 0) {
            await dbRun("INSERT INTO items (name, category, purchasePrice, salePrice) VALUES (?, ?, ?, ?)", ["Laptop", "Electronics", 1200, 1500]);
            await dbRun("INSERT INTO items (name, category, purchasePrice, salePrice) VALUES (?, ?, ?, ?)", ["Keyboard", "Accessories", 50, 75]);
            console.log("Données initiales insérées dans 'items'.");
        }

        // Table stores
        await dbRun(`
            CREATE TABLE IF NOT EXISTS stores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT UNIQUE,
                name TEXT NOT NULL UNIQUE,
                zone TEXT
            )
        `);
        console.log("Table 'stores' prête.");

        const storesCount = await dbGet("SELECT COUNT(*) AS count FROM stores");
        if (storesCount.count === 0) {
            await dbRun("INSERT INTO stores (code, name, zone) VALUES (?, ?, ?)", ["ST-001", "Main Warehouse", JSON.stringify(["North Zone"])]);
            await dbRun("INSERT INTO stores (code, name, zone) VALUES (?, ?, ?)", ["ST-002", "Backup Store", JSON.stringify(["South Zone"])]);
            console.log("Données initiales insérées dans 'stores'.");
        }

    } catch (err) {
        console.error("Erreur lors de l'initialisation de la base de données:", err.message);
    }
}

// Lancer l'initialisation
initializeDatabase();

// --- Exportations ---
module.exports = {
    dbRun,
    dbAll,
    dbGet,
    db
};
