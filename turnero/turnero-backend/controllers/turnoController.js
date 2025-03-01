const Turno = require("../models/Turno");
const Cancha = require("../models/Cancha");

// Función para convertir fecha y hora en objeto Date
const getTurnoDateTime = (date, time) => {
  const [hours, minutes] = time.split(':');
  const turnoDate = new Date(date);
  turnoDate.setUTCHours(hours, minutes, 0, 0);
  return turnoDate;
};

// 🔹 Función para actualizar los horarios de la cancha cuando un turno cambia de estado
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

// Crear un nuevo turno (establece estado en "reservado")
const createTurno = async (req, res, next) => {
  const { date, startTime, endTime, title, description, cancha } = req.body;
  
  try {
    const startDateTime = getTurnoDateTime(date, startTime);
    const endDateTime = getTurnoDateTime(date, endTime);

    // Verificar si el turno ya está reservado
    const existingTurno = await Turno.findOne({ 
      date: new Date(date), 
      startTime: startDateTime, 
      cancha, 
      status: "reservado" 
    });

    if (existingTurno) {
      return res.status(400).json({ msg: "El turno ya está reservado para esa fecha y horario." });
    }

    // Crear turno con estado "reservado"
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

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    // Buscar turnos reservados o cancelados
    const turnosOcupados = await Turno.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      cancha,
      status: { $in: ["reservado", "cancelado"] } 
    }).select("startTime endTime");

    const canchaData = await Cancha.findById(cancha).select("horarios");

    if (!canchaData) {
      return res.status(404).json({ msg: "Cancha no encontrada" });
    }

    // Filtrar horarios disponibles
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

// 🔹 Actualizar un turno
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
    const ahora = new Date();
    const turnosVencidos = await Turno.find({ status: "reservado", endTime: { $lt: ahora } });

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

// 🔹 Cancelar un turno (cambia estado a "cancelado")
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

    // ✅ Si la hora de inicio aún no pasó, liberar el horario en la cancha
    const ahora = new Date();
    if (turno.startTime > ahora) {
      await actualizarHorariosCancha(turno.cancha, turno.startTime, turno.endTime, null);
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
