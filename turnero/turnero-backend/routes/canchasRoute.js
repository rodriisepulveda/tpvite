const express = require("express");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const canchaController = require('../controllers/canchaController');

// Ruta para agregar una cancha
router.post(
  "/",
  [
    auth,
    [
      check("name", "El nombre es obligatorio").not().isEmpty(),
      check("description", "La descripción es obligatoria").not().isEmpty(),
      check("location", "La ubicación es obligatoria").not().isEmpty(),
    ],
  ],
  canchaController.createCancha
);

// Ruta para obtener todas las canchas
router.get("/", canchaController.getAllCanchas);

// Ruta para actualizar una cancha
router.put("/:id", auth, canchaController.updateCancha);

// Ruta para eliminar una cancha
router.delete("/:id", auth, canchaController.deleteCancha);

// Ruta para reservar un turno
router.put('/:canchaId/reserve/:horarioId', auth, canchaController.reserveTurno);

// Ruta para cancelar un turno
router.put('/:canchaId/cancel/:horarioId', auth, canchaController.cancelTurno);

module.exports = router;