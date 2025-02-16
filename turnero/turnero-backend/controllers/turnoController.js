const Turno = require("../models/Turno");
const Cancha = require("../models/Cancha");

// Crear un nuevo turno
exports.createTurno = async (req, res, next) => {
  const { date, startTime, endTime, title, description, cancha } = req.body;
  try {
    const existingTurno = await Turno.findOne({ date, startTime, cancha });
    if (existingTurno) {
      return res.status(400).json({ msg: "El turno ya está reservado." });
    }

    const newTurno = new Turno({
      date,
      startTime,
      endTime,
      title,
      description,
      cancha,
      user: req.user.id,
    });

    const turno = await newTurno.save();

    // Marcar el horario como reservado en la cancha
    await Cancha.updateOne(
      { _id: cancha, "horarios.startTime": startTime },
      { $set: { "horarios.$.usuario": req.user.id } }
    );

    res.status(201).json(turno);
  } catch (err) {
    console.error("Error en createTurno:", err);
    next(err);
  }
};

// Obtener un turno por ID
exports.getTurnoById = async (req, res, next) => {
  try {
    const turno = await Turno.findById(req.params.id).populate("cancha", "name description location");
    if (!turno) {
      return res.status(404).json({ msg: "Turno no encontrado" });
    }
    res.json(turno);
  } catch (err) {
    console.error("Error en getTurnoById:", err);
    next(err);
  }
};

// Obtener todas las reservas del usuario autenticado
exports.getMyTurnos = async (req, res, next) => {
  try {
    const turnos = await Turno.find({ user: req.user.id }).populate("cancha", "name description location precio");
    res.json(turnos);
  } catch (err) {
    console.error("Error en getMyTurnos:", err);
    next(err);
  }
};

// Obtener horarios libres de una cancha para una fecha específica
exports.getHorariosLibres = async (req, res, next) => {
  const { date, cancha } = req.query;

  if (!date || !cancha) {
    return res.status(400).json({ msg: "Faltan parámetros: date y cancha son requeridos" });
  }

  try {
    const turnosReservados = await Turno.find({ date, cancha }).select("startTime endTime");
    const canchaData = await Cancha.findById(cancha).select("horarios");

    if (!canchaData) {
      return res.status(404).json({ msg: "Cancha no encontrada" });
    }

    const horariosLibres = canchaData.horarios.filter(
      (horario) =>
        !turnosReservados.some(
          (turno) =>
            String(turno.startTime) === String(horario.startTime) &&
            String(turno.endTime) === String(horario.endTime)
        )
    );

    res.json(horariosLibres);
  } catch (err) {
    console.error("Error en getHorariosLibres:", err);
    next(err);
  }
};

// Actualizar un turno existente
exports.updateTurno = async (req, res, next) => {
  const { date, startTime, endTime, cancha } = req.body;
  try {
    const turno = await Turno.findById(req.params.id);
    if (!turno) return res.status(404).json({ msg: "Turno no encontrado" });

    // Liberar el horario anterior
    await Cancha.updateOne(
      { _id: turno.cancha, "horarios.startTime": turno.startTime },
      { $set: { "horarios.$.usuario": null } }
    );

    // Actualizar los datos del turno
    turno.date = date;
    turno.startTime = startTime;
    turno.endTime = endTime;
    turno.cancha = cancha;

    await turno.save();

    // Marcar el nuevo horario como reservado
    await Cancha.updateOne(
      { _id: cancha, "horarios.startTime": startTime },
      { $set: { "horarios.$.usuario": req.user.id } }
    );

    res.json(turno);
  } catch (err) {
    console.error("Error en updateTurno:", err);
    next(err);
  }
};

// Eliminar un turno por ID
exports.deleteTurno = async (req, res, next) => {
  try {
    const turno = await Turno.findById(req.params.id);
    if (!turno) return res.status(404).json({ msg: "Turno no encontrado" });

    // Liberar el horario reservado
    await Cancha.updateOne(
      { _id: turno.cancha, "horarios.startTime": turno.startTime },
      { $set: { "horarios.$.usuario": null } }
    );

    await turno.remove();
    res.json({ msg: "Turno eliminado, horario disponible nuevamente" });
  } catch (err) {
    console.error("Error en deleteTurno:", err);
    next(err);
  }
};
