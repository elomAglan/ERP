const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dbModule = require("./database"); // ⚡️ Connexion à la base (objet avec db, dbRun, dbAll, dbGet)

const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/itemRoutes");
const storeRoutes = require("./routes/storeRoutes");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ⚡️ Injecter l'instance SQLite pour que les contrôleurs y aient accès
app.locals.db = dbModule.db; // <-- ici, on prend la vraie connexion SQLite

// Définition des routes
app.use("/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/stores", storeRoutes);

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
