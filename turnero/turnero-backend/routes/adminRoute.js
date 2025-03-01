const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Rutas protegidas para el administrador
router.get("/estadisticas", auth, isAdmin, adminController.getEstadisticas);
router.get("/reservas", auth, isAdmin, adminController.getReservas);
router.get("/usuarios", auth, isAdmin, adminController.getUsuarios);
router.put("/usuarios/:id/estado", auth, isAdmin, adminController.updateUserStatus);

module.exports = router;
