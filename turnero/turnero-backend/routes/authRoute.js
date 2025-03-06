const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret"; 

// 📌 **Ruta de Login (Corregida)**
router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Datos recibidos para login:", req.body); 

  try {
    // Permitir login con username o email
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      console.log("Credenciales incorrectas - usuario no encontrado");
      return res.status(400).json({ msg: "Credenciales incorrectas" });
    }

    console.log("Contraseña almacenada en la base de datos:", user.password); 
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Resultado de la comparación de contraseñas:", isMatch);

    if (!isMatch) {
      console.log("Credenciales incorrectas - contraseña incorrecta");
      return res.status(400).json({ msg: "Credenciales incorrectas" });
    }

    const payload = { user: { id: user.id, username: user.username, role: user.role } };
    jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    });
  } catch (err) {
    console.error("Error en el login:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
