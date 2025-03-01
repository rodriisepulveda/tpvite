const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    console.log("🔴 No token provided");
    return res.status(401).json({ msg: "No hay token, autorización denegada" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.user = decoded.user || decoded;

    const usuario = await User.findById(req.user.id);

    if (!usuario) {
      console.log("🔴 Usuario no encontrado");
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    if (usuario.estado === "Deshabilitado") {
      console.log(`🚫 Usuario ${usuario.username} está deshabilitado.`);
      return res.status(403).json({ msg: "Tu cuenta ha sido deshabilitada. Contacta con un administrador." });
    }

    if (usuario.estado === "Suspendido" && new Date(usuario.suspensionHasta) > new Date()) {
      console.log(`⏳ Usuario ${usuario.username} suspendido hasta:`, usuario.suspensionHasta);
      return res.status(403).json({ msg: `Tu cuenta está suspendida hasta el ${new Date(usuario.suspensionHasta).toLocaleDateString()}.` });
    }

    next();
  } catch (err) {
    console.error("❌ Token no válido:", err.message);
    res.status(401).json({ msg: "Token no válido" });
  }
};
