const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/update-username", authController.updateUsername);
router.put("/update-password", authController.updatePassword);

module.exports = router;
