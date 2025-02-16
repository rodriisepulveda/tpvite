const Turno = require("../models/Turno");
const Cancha = require("../models/Cancha");

// Función para convertir una fecha y hora específica en un objeto Date
const getTurnoDateTime = (date, time) => {
  const [hours, minutes] = time.split(':');
  const turnoDate = new Date(date);
  turnoDate.setUTCHours(hours, minutes, 0, 0);
  return turnoDate;
};

// Crear un nuevo turno
const createTurno = async (req, res, next) => {
  const { date, startTime, endTime, title, description, cancha } = req.body;
  console.log("Datos recibidos en createTurno:", { date, startTime, endTime, title, description, cancha });

  try {
    const startDateTime = getTurnoDateTime(date, startTime);
    const endDateTime = getTurnoDateTime(date, endTime);
    console.log("Fechas generadas:", { startDateTime, endDateTime });

    const existingTurno = await Turno.findOne({ date: new Date(date), startTime: startDateTime, cancha });
    if (existingTurno) {
      console.log("Turno ya reservado:", existingTurno);
      return res.status(400).json({ msg: "El turno ya está reservado para esa fecha y horario." });
    }

    const newTurno = new Turno({
      date: new Date(date),
      startTime: startDateTime,
      endTime: endDateTime,
      title,
      description,
      cancha,
      user: req.user.id,
    });

    console.log("Antes de guardar el turno");
    const turno = await newTurno.save();
    console.log("Turno guardado:", turno);

    res.status(201).json(turno);
  } catch (err) {
    console.error("Error en createTurno:", err);
    next(err);
  }
};

// Obtener horarios libres de una cancha para una fecha específica
const getHorariosLibres = async (req, res, next) => {
  const { date, cancha } = req.query;
  console.log("Datos recibidos en getHorariosLibres:", { date, cancha });

  if (!date || !cancha) {
    return res.status(400).json({ msg: "Faltan parámetros: date y cancha son requeridos" });
  }

  try {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const turnosReservados = await Turno.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      cancha,
    }).select("startTime endTime");

    console.log("Turnos reservados:", turnosReservados);

    const canchaData = await Cancha.findById(cancha).select("horarios");

    if (!canchaData) {
      console.log("Cancha no encontrada");
      return res.status(404).json({ msg: "Cancha no encontrada" });
    }

    const horariosLibres = canchaData.horarios.filter(
      (horario) =>
        !turnosReservados.some(
          (turno) =>
            turno.startTime.getTime() === getTurnoDateTime(date, horario.startTime).getTime() &&
            turno.endTime.getTime() === getTurnoDateTime(date, horario.endTime).getTime()
        )
    );

    console.log("Horarios libres encontrados:", horariosLibres);
    res.json(horariosLibres);
  } catch (err) {
    console.error("Error en getHorariosLibres:", err);
    next(err);
  }
};

// Obtener todas las reservas del usuario autenticado
const getMyTurnos = async (req, res, next) => {
  console.log("Buscando reservas del usuario:", req.user.id);
  try {
    const turnos = await Turno.find({ user: req.user.id }).populate("cancha", "name description location");
    console.log("Reservas encontradas:", turnos);
    res.json(turnos);
  } catch (err) {
    console.error("Error en getMyTurnos:", err);
    next(err);
  }
};

// Obtener un turno por ID
const getTurnoById = async (req, res, next) => {
  console.log("Buscando turno por ID:", req.params.id);
  try {
    const turno = await Turno.findById(req.params.id).populate("cancha", "name description location");
    if (!turno) {
      console.log("Turno no encontrado");
      return res.status(404).json({ msg: "Turno no encontrado" });
    }
    res.json(turno);
  } catch (err) {
    console.error("Error en getTurnoById:", err);
    next(err);
  }
};

// Actualizar un turno
const updateTurno = async (req, res, next) => {
  const { date, startTime, endTime, cancha } = req.body;
  console.log("Datos para actualizar turno:", { date, startTime, endTime, cancha });

  try {
    const startDateTime = getTurnoDateTime(date, startTime);
    const endDateTime = getTurnoDateTime(date, endTime);

    const turno = await Turno.findById(req.params.id);
    if (!turno) {
      console.log("Turno no encontrado");
      return res.status(404).json({ msg: "Turno no encontrado" });
    }

    turno.date = new Date(date);
    turno.startTime = startDateTime;
    turno.endTime = endDateTime;
    turno.cancha = cancha;

    const updatedTurno = await turno.save();
    console.log("Turno actualizado:", updatedTurno);

    res.json(updatedTurno);
  } catch (err) {
    console.error("Error en updateTurno:", err);
    next(err);
  }
};

// Eliminar un turno
const deleteTurno = async (req, res, next) => {
  console.log("Eliminando turno con ID:", req.params.id);
  try {
    const turno = await Turno.findById(req.params.id);
    if (!turno) {
      console.log("Turno no encontrado");
      return res.status(404).json({ msg: "Turno no encontrado" });
    }

    await turno.remove();
    console.log("Turno eliminado");
    res.json({ msg: "Turno eliminado correctamente" });
  } catch (err) {
    console.error("Error en deleteTurno:", err);
    next(err);
  }
};

module.exports = {
  createTurno,
  getHorariosLibres,
  getTurnoById,
  updateTurno,
  deleteTurno,
  getMyTurnos,
};
