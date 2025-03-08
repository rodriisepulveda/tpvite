const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

// 📌 **Ruta de Registro (Con Encriptación)**
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res.status(400).json({ msg: "El usuario o email ya están en uso." });
    }

    // 🔹 Encripta la contraseña aquí
    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ username, email, password: hashedPassword, role: "user" });
    await user.save();

    res.status(201).json({ msg: "Usuario registrado correctamente." });
  } catch (err) {
    console.error("Error en el registro:", err);
    res.status(500).json({ msg: "Error en el servidor." });
  }
});

// 📌 **Ruta de Login (Con Comparación de Hash)**
router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Datos recibidos para login:", req.body);

  try {
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (username) {
      user = await User.findOne({ username });
    }

    if (!user) {
      console.log("❌ Usuario no encontrado");
      return res.status(400).json({ msg: "Credenciales incorrectas" });
    }

    console.log("🔒 Contraseña almacenada en la base de datos:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Comparación de contraseñas:", isMatch);

    if (!isMatch) {
      console.log("❌ Credenciales incorrectas - contraseña incorrecta");
      return res.status(400).json({ msg: "Credenciales incorrectas" });
    }

    const payload = { user: { id: user.id, username: user.username, email: user.email, role: user.role } };
    jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: payload.user });
    });
  } catch (err) {
    console.error("❌ Error en el login:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
