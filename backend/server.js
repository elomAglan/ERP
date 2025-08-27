const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database"); // Importez votre module de base de données
const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/itemRoutes");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rend l'objet de base de données accessible aux routes et contrôleurs
app.locals.db = db;

// Définition des routes
app.use("/auth", authRoutes);
app.use("/api/items", itemRoutes);

app.listen(PORT, () => {
  console.log("🚀 Serveur démarré sur http://localhost:5000");
});