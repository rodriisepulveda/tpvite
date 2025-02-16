const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret"; // Usa variables de entorno

// 📌 **Ruta de Registro**
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  console.log("Datos recibidos para registro:", req.body); // Log de datos recibidos
  try {
    let user = await User.findOne({ username });
    if (user) {
      console.log("El usuario ya existe"); // Log de usuario existente
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    // No encriptes la contraseña manualmente aquí
    user = new User({ username, password, role });
    await user.save(); // El hook pre('save') se encargará de encriptar la contraseña

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error("Error en el registro:", err.message); // Log de error
    res.status(500).send("Server error");
  }
});

// 📌 **Ruta de Login**
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Datos recibidos para login:", req.body); // Log de datos recibidos
  try {
    let user = await User.findOne({ username });
    if (!user) {
      console.log("Credenciales incorrectas - usuario no encontrado"); // Log de error de credenciales
      return res.status(400).json({ msg: "Credenciales incorrectas" });
    }

    console.log("Contraseña almacenada en la base de datos:", user.password); // Log de contraseña almacenada
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Resultado de la comparación de contraseñas:", isMatch); // Log del resultado de la comparación

    if (!isMatch) {
      console.log("Credenciales incorrectas - contraseña incorrecta"); // Log de error de credenciales
      return res.status(400).json({ msg: "Credenciales Incorrectas" });
    }

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } }); // Envía el token y los datos del usuario
    });
  } catch (err) {
    console.error("Error en el login:", err.message); // Log de error
    res.status(500).send("Server error");
  }
});

module.exports = router;