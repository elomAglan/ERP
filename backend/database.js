// database.js
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const db = new sqlite3.Database("./database.sqlite");

db.serialize(() => {
    // Crée la table users
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `, (err) => {
        if (err) {
            console.error("Erreur de création de la table 'users':", err.message);
        } else {
            console.log("Table 'users' créée ou déjà existante.");
            // Ajoute un utilisateur par défaut si la table est vide
            const username = "user";
            const password = bcrypt.hashSync("1234", 10);

            db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
                if (err) {
                    console.error("Erreur de vérification de l'utilisateur:", err);
                    return;
                }
                if (!row) {
                    db.run(
                        "INSERT INTO users (username, password) VALUES (?, ?)",
                        [username, password],
                        function (err) {
                            if (err) console.error("Erreur d'insertion de l'utilisateur:", err);
                            else console.log("Utilisateur par défaut ajouté :", username);
                        }
                    );
                } else {
                    console.log("Utilisateur par défaut déjà existant :", username);
                }
            });
        }
    });

    // Crée la table items
    db.run(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            purchasePrice REAL NOT NULL,
            salePrice REAL
        )
    `, (err) => {
        if (err) {
            console.error("Erreur de création de la table 'items':", err.message);
        } else {
            console.log("Table 'items' créée ou déjà existante.");
        }
    });
});

module.exports = db;