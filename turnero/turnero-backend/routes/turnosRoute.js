const express = require("express");
const { check } = require("express-validator");
const auth = require("../middleware/auth");
const router = express.Router();
const turnoController = require("../controllers/turnoController");

console.log(turnoController);
// Ruta para agregar un turno con validaciones
router.post(
  "/",
  auth,
  [
    check("date", "La fecha es obligatoria").not().isEmpty(),
    check("startTime", "La hora de inicio es obligatoria").not().isEmpty(),
    check("endTime", "La hora de fin es obligatoria").not().isEmpty(),
    check("title", "El título es obligatorio").not().isEmpty(),
    check("description", "La descripción es obligatoria").not().isEmpty(),
  ],
  turnoController.createTurno
);

// Ruta para obtener las reservas del usuario autenticado
router.get("/misreservas", auth, turnoController.getMyTurnos);

// Ruta para obtener una reserva específica por ID
router.get("/id/:id", auth, turnoController.getTurnoById);

// Nueva ruta para obtener turnos libres para una fecha específica y cancha
router.get("/libres", auth, turnoController.getHorariosLibres);

// Ruta para actualizar un turno
router.put("/:id", auth, turnoController.updateTurno);

// Ruta para eliminar un turno
router.delete("/:id", auth, turnoController.deleteTurno);

module.exports = router;
