const express = require("express");
const cors = require("cors");
const dbModule = require("./database"); // Connexion SQLite

const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/itemRoutes");
const storeRoutes = require("./routes/storeRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes"); // ✅ Inventaire

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Remplace body-parser.json()

// Injecter DB si besoin
app.locals.db = dbModule.db;

// Routes
app.use("/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/inventory", inventoryRoutes); // ✅ Inventaire

// Route test
app.get("/", (req, res) => res.send("API OK"));

// Lancer serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
