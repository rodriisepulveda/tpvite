const Turno = require("../models/Turno");
const Cancha = require("../models/Cancha");
const getGMT3Date = require("../utils/getGMT3Date"); // ✅ Utilizando el helper GMT-3

// 🔹 Función para convertir fecha y hora en objeto Date en GMT-3
const getTurnoDateTime = (date, time) => {
  return new Date(`${date}T${time}:00-03:00`);
};

// 🔹 Función para actualizar horarios de cancha
const actualizarHorariosCancha = async (canchaId, startTime, endTime, usuario = null) => {
  try {
    const cancha = await Cancha.findById(canchaId);
    if (!cancha) return;

    const horario = cancha.horarios.find(
      (h) => h.startTime === startTime && h.endTime === endTime
    );

    if (horario) {
      horario.usuario = usuario;
      await cancha.save({ validateModifiedOnly: true });
    }
  } catch (err) {
    console.error("Error actualizando horarios de cancha:", err);
  }
};

// 🔹 Crear un nuevo turno
const createTurno = async (req, res, next) => {
  const { date, startTime, endTime, title, description, cancha } = req.body;

  try {
    const startDateTime = getTurnoDateTime(date, startTime);
    const endDateTime = getTurnoDateTime(date, endTime);

    const existingTurno = await Turno.findOne({
      date: new Date(date),
      startTime: startDateTime,
      cancha,
      status: "reservado",
    });

    if (existingTurno) {
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
      status: "reservado",
    });

    const turno = await newTurno.save();
    await actualizarHorariosCancha(cancha, startTime, endTime, req.user.id);

    res.status(201).json(turno);
  } catch (err) {
    console.error("Error en createTurno:", err);
    next(err);
  }
};

// 🔹 Obtener horarios libres de una cancha
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

    const canchaData = await Cancha.findById(cancha).select("horarios");

    if (!canchaData) {
      return res.status(404).json({ msg: "Cancha no encontrada" });
    }

    const horariosLibres = canchaData.horarios.filter(
      (horario) =>
        !turnosOcupados.some(
          (turno) =>
            turno.startTime.getTime() === getTurnoDateTime(date, horario.startTime).getTime() &&
            turno.endTime.getTime() === getTurnoDateTime(date, horario.endTime).getTime()
        )
    );

    res.json(horariosLibres);
  } catch (err) {
    console.error("Error en getHorariosLibres:", err);
    next(err);
  }
};

// 🔹 Obtener reservas del usuario autenticado
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

// 🔹 Obtener un turno por ID
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

// 🔹 Actualizar un turno existente
const updateTurno = async (req, res, next) => {
  try {
    await updateTurnosConcluidos();
    const { date, startTime, endTime, cancha } = req.body;

    const startDateTime = getTurnoDateTime(date, startTime);
    const endDateTime = getTurnoDateTime(date, endTime);

    const turno = await Turno.findById(req.params.id);
    if (!turno) {
      return res.status(404).json({ msg: "Turno no encontrado" });
    }

    turno.date = new Date(date);
    turno.startTime = startDateTime;
    turno.endTime = endDateTime;
    turno.cancha = cancha;

    const updatedTurno = await turno.save();
    res.json(updatedTurno);
  } catch (err) {
    console.error("Error en updateTurno:", err);
    next(err);
  }
};

// 🔹 Actualizar turnos vencidos a "concluido"
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
      await actualizarHorariosCancha(turno.cancha, turno.startTime, turno.endTime);
    }

    console.log(`✅ ${turnosVencidos.length} turnos actualizados a 'concluido'.`);
  } catch (err) {
    console.error("❌ Error al actualizar turnos concluidos:", err);
  }
};

// 🔹 Cancelar un turno
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
    if (turno.startTime > ahoraGMT3) {
      await actualizarHorariosCancha(turno.cancha, turno.startTime, turno.endTime, null);
      await Turno.deleteOne({ _id: turno._id });
    }

    res.json({ msg: "Turno cancelado correctamente y horario liberado", turno });
  } catch (err) {
    console.error("Error en cancelTurno:", err);
    next(err);
  }
};

// 🔹 Exportar funciones
module.exports = {
  createTurno,
  getHorariosLibres,
  getTurnoById,
  updateTurno,
  cancelTurno,
  getMyTurnos,
  updateTurnosConcluidos
};
