const Turno = require("../models/Turno");
const Cancha = require("../models/Cancha");
const getGMT3Date = require("../utils/getGMT3Date");

// Horarios predefinidos
const horariosPredefinidos = [
  { startTime: "14:00", endTime: "15:30" },
  { startTime: "15:30", endTime: "17:00" },
  { startTime: "17:00", endTime: "18:30" },
  { startTime: "18:30", endTime: "20:00" },
  { startTime: "20:00", endTime: "21:30" },
  { startTime: "21:30", endTime: "23:00" },
];

// Función para convertir fecha y hora en objeto Date en GMT-3
const getTurnoDateTime = (date, time) => {
  return new Date(`${date}T${time}:00-03:00`);
};

// Crear un nuevo turno
const createTurno = async (req, res, next) => {
  const { date, startTime, endTime, title, description, cancha } = req.body;

  try {
    // Verificar que el horario esté dentro de los horarios predefinidos
    const horarioValido = horariosPredefinidos.some(
      (h) => h.startTime === startTime && h.endTime === endTime
    );
    if (!horarioValido) {
      return res.status(400).json({
        msg: "El horario proporcionado no es válido. Horarios disponibles: 14:00-15:30, 15:30-17:00, 17:00-18:30, 18:30-20:00, 20:00-21:30, 21:30-23:00."
      });
    }

    const startDateTime = getTurnoDateTime(date, startTime);
    const endDateTime = getTurnoDateTime(date, endTime);
    // Almacenar la fecha en GMT-3 (medianoche) para que la comparación sea consistente
    const turnoDate = getTurnoDateTime(date, "00:00");

    const existingTurno = await Turno.findOne({
      date: turnoDate,
      startTime: startDateTime,
      cancha,
      status: "reservado",
    });

    if (existingTurno) {
      return res.status(400).json({ msg: "El turno ya está reservado para esa fecha y horario." });
    }

    const newTurno = new Turno({
      date: turnoDate,
      startTime: startDateTime,
      endTime: endDateTime,
      title,
      description,
      cancha,
      user: req.user.id,
      status: "reservado",
    });

    const turno = await newTurno.save();
    // No se actualizan horarios en la cancha ya que se usan los predefinidos
    res.status(201).json(turno);
  } catch (err) {
    console.error("Error en createTurno:", err);
    next(err);
  }
};

// Obtener horarios libres de una cancha usando horarios predefinidos
// Obtener horarios libres de una cancha usando horarios predefinidos
const getHorariosLibres = async (req, res, next) => {
  try {
    await updateTurnosConcluidos();
    const { date, cancha } = req.query;

    if (!date || !cancha) {
      return res.status(400).json({ msg: "Faltan parámetros: date y cancha son requeridos" });
    }

    const startOfDay = getTurnoDateTime(date, "00:00");
    const endOfDay = getTurnoDateTime(date, "23:59");

    const turnosOcupados = await Turno.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      cancha,
      status: { $in: ["reservado", "cancelado"] }
    }).select("startTime endTime");

    // Filtrar los horarios predefinidos que no estén ocupados
    let horariosLibres = horariosPredefinidos.filter((horario) => {
      return !turnosOcupados.some((turno) => {
        return (
          turno.startTime.getTime() === getTurnoDateTime(date, horario.startTime).getTime() &&
          turno.endTime.getTime() === getTurnoDateTime(date, horario.endTime).getTime()
        );
      });
    });

    // Asignar un _id único a cada horario
    horariosLibres = horariosLibres.map((horario, index) => ({
      _id: String(index), // o cualquier identificador único
      ...horario
    }));

    res.json(horariosLibres);
  } catch (err) {
    console.error("Error en getHorariosLibres:", err);
    next(err);
  }
};


// Obtener reservas del usuario autenticado
const getMyTurnos = async (req, res, next) => {
  try {
    await updateTurnosConcluidos();
    const turnos = await Turno.find({ user: req.user.id }).populate("cancha", "name description location");
    res.json(turnos);
  } catch (err) {
    console.error("Error en getMyTurnos:", err);
    next(err);
  }
};

// Obtener un turno por ID
const getTurnoById = async (req, res, next) => {
  try {
    await updateTurnosConcluidos();
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

// Actualizar un turno existente (para editar reserva)
// Se almacena el horario anterior y se actualiza con el nuevo. De este modo, el horario viejo queda libre.
const updateTurno = async (req, res, next) => {
  try {
    await updateTurnosConcluidos();
    const { date, startTime, endTime, cancha } = req.body;

    // Verificar que el horario esté dentro de los horarios predefinidos
    const horarioValido = horariosPredefinidos.some(
      (h) => h.startTime === startTime && h.endTime === endTime
    );
    if (!horarioValido) {
      return res.status(400).json({
        msg: "El horario proporcionado no es válido. Horarios disponibles: 14:00-15:30, 15:30-17:00, 17:00-18:30, 18:30-20:00, 20:00-21:30, 21:30-23:00."
      });
    }

    const newStartDateTime = getTurnoDateTime(date, startTime);
    const newEndDateTime = getTurnoDateTime(date, endTime);
    const newTurnoDate = getTurnoDateTime(date, "00:00");

    const turno = await Turno.findById(req.params.id);
    if (!turno) {
      return res.status(404).json({ msg: "Turno no encontrado" });
    }

    // Guardamos el horario anterior para propósitos de depuración o log
    const oldStartTime = turno.startTime;
    const oldEndTime = turno.endTime;

    turno.date = newTurnoDate;
    turno.startTime = newStartDateTime;
    turno.endTime = newEndDateTime;
    turno.cancha = cancha;

    const updatedTurno = await turno.save();
    console.log("Reserva actualizada. Horario anterior:", oldStartTime, "-", oldEndTime, 
                " | Nuevo horario:", newStartDateTime, "-", newEndDateTime);
    res.json(updatedTurno);
  } catch (err) {
    console.error("Error en updateTurno:", err);
    next(err);
  }
};

// Actualizar turnos vencidos a "concluido"
const updateTurnosConcluidos = async () => {
  try {
    const ahoraGMT3 = getGMT3Date();

    const turnosVencidos = await Turno.find({
      status: "reservado",
      endTime: { $lt: ahoraGMT3 }
    });

    for (const turno of turnosVencidos) {
      turno.status = "concluido";
      await turno.save();
    }

    console.log(`✅ ${turnosVencidos.length} turnos actualizados a 'concluido'.`);
  } catch (err) {
    console.error("❌ Error al actualizar turnos concluidos:", err);
  }
};

// Cancelar un turno
// Si el turno aún no inició, se elimina el documento, liberando el horario
const cancelTurno = async (req, res, next) => {
  try {
    await updateTurnosConcluidos();
    const turno = await Turno.findById(req.params.id);
    if (!turno) {
      return res.status(404).json({ msg: "Turno no encontrado" });
    }

    if (turno.status === "cancelado") {
      return res.status(400).json({ msg: "Este turno ya ha sido cancelado." });
    }

    turno.status = "cancelado";
    await turno.save();

    const ahoraGMT3 = getGMT3Date();
    if (turno.startTime.getTime() > ahoraGMT3.getTime()) {
      // Si el turno aún no inició, lo eliminamos para liberar el horario
      await Turno.deleteOne({ _id: turno._id });
    }

    res.json({ msg: "Turno cancelado correctamente y horario liberado", turno });
  } catch (err) {
    console.error("Error en cancelTurno:", err);
    next(err);
  }
};

module.exports = {
  createTurno,
  getHorariosLibres,
  getTurnoById,
  updateTurno,
  cancelTurno,
  getMyTurnos,
  updateTurnosConcluidos
};
