const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Exemple d’API : obtenir un message
app.get("/api/hello", (req, res) => {
  res.json({ message: "Bienvenue dans l’app de gestion 🚀" });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Express lancé sur http://localhost:${PORT}`);
});
