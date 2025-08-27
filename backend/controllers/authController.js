const bcrypt = require("bcryptjs");
const db = require("../database");

// ---------------------------
// REGISTER
// ---------------------------
exports.register = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username et mot de passe requis" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Nom d'utilisateur déjà utilisé" });
        }
        return res.status(500).json({ error: "Erreur serveur", details: err });
      }
      res.json({ message: "Utilisateur enregistré avec succès", id: this.lastID });
    }
  );
};

// ---------------------------
// LOGIN
// ---------------------------
exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username et mot de passe requis" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) return res.status(500).json({ error: "Erreur serveur", details: err });
    if (!row) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const passwordMatch = bcrypt.compareSync(password, row.password);
    if (!passwordMatch) return res.status(401).json({ error: "Mot de passe incorrect" });

    res.json({ message: "Connecté avec succès", id: row.id, username: row.username });
  });
};

// ---------------------------
// UPDATE USERNAME
// ---------------------------
exports.updateUsername = (req, res) => {
  const { id, newUsername } = req.body;

  if (!id || !newUsername) {
    return res.status(400).json({ error: "ID et nouveau username requis" });
  }

  db.run(
    "UPDATE users SET username = ? WHERE id = ?",
    [newUsername, id],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Nom d'utilisateur déjà utilisé" });
        }
        return res.status(500).json({ error: "Erreur serveur", details: err });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Utilisateur introuvable" });
      }

      res.json({ message: "Username mis à jour avec succès" });
    }
  );
};

// ---------------------------
// UPDATE PASSWORD
// ---------------------------
exports.updatePassword = (req, res) => {
  const { id, currentPassword, newPassword } = req.body;

  if (!id || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "ID, mot de passe actuel et nouveau mot de passe requis" });
  }

  // Vérifier le mot de passe actuel avant de changer
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "Erreur serveur", details: err });
    if (!row) return res.status(404).json({ error: "Utilisateur introuvable" });

    const passwordMatch = bcrypt.compareSync(currentPassword, row.password);
    if (!passwordMatch) return res.status(401).json({ error: "Mot de passe actuel incorrect" });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id],
      function (err) {
        if (err) return res.status(500).json({ error: "Erreur serveur", details: err });
        res.json({ message: "Mot de passe mis à jour avec succès" });
      }
    );
  });
};
