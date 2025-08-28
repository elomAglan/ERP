const bcrypt = require("bcryptjs");
const { dbRun, dbGet } = require("../database");

// ---------------------------
// REGISTER
// ---------------------------
exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username et mot de passe requis" });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = await dbRun(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    res.json({
      message: "Utilisateur enregistré avec succès",
      id: result.id,
    });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Nom d'utilisateur déjà utilisé" });
    }
    return res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

// ---------------------------
// LOGIN
// ---------------------------
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username et mot de passe requis" });
  }

  try {
    const row = await dbGet("SELECT * FROM users WHERE username = ?", [username]);
    if (!row) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const passwordMatch = bcrypt.compareSync(password, row.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    res.json({ message: "Connecté avec succès", id: row.id, username: row.username });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

// ---------------------------
// UPDATE USERNAME
// ---------------------------
exports.updateUsername = async (req, res) => {
  const { id, newUsername } = req.body;

  if (!id || !newUsername) {
    return res.status(400).json({ error: "ID et nouveau username requis" });
  }

  try {
    const result = await dbRun("UPDATE users SET username = ? WHERE id = ?", [
      newUsername,
      id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json({ message: "Username mis à jour avec succès" });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Nom d'utilisateur déjà utilisé" });
    }
    return res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

// ---------------------------
// UPDATE PASSWORD
// ---------------------------
exports.updatePassword = async (req, res) => {
  const { id, currentPassword, newPassword } = req.body;

  if (!id || !currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "ID, mot de passe actuel et nouveau mot de passe requis" });
  }

  try {
    const row = await dbGet("SELECT * FROM users WHERE id = ?", [id]);
    if (!row) return res.status(404).json({ error: "Utilisateur introuvable" });

    const passwordMatch = bcrypt.compareSync(currentPassword, row.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Mot de passe actuel incorrect" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await dbRun("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id]);

    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};
