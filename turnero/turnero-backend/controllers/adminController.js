const mongoose = require("mongoose");
const Turno = require("../models/Turno");
const User = require("../models/User");
const Cancha = require("../models/Cancha");

// Obtener estadísticas generales
const getEstadisticas = async (req, res) => {
    try {
        const totalReservas = await Turno.countDocuments({ status: "reservado" });
        const totalCanceladas = await Turno.countDocuments({ status: "cancelado" });
        const totalConcluidas = await Turno.countDocuments({ status: "concluido" });

        // Cancha más reservada
        const canchaMasReservada = await Turno.aggregate([
            { $match: { status: "reservado" } },
            { $group: { _id: "$cancha", total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 1 },
            { 
                $lookup: {
                    from: "canchas",
                    localField: "_id",
                    foreignField: "_id",
                    as: "canchaInfo"
                }
            },
            { $unwind: { path: "$canchaInfo", preserveNullAndEmptyArrays: true } }
        ]);

        // Usuario más activo
        const usuarioMasActivo = await Turno.aggregate([
            { $match: { status: "reservado" } },
            { $group: { _id: "$user", total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } }
        ]);

        res.json({
            totalReservas,
            totalCanceladas,
            totalConcluidas,
            canchaMasReservada: canchaMasReservada.length > 0 ? canchaMasReservada[0].canchaInfo?.name || "N/A" : "N/A",
            usuarioMasActivo: usuarioMasActivo.length > 0 ? usuarioMasActivo[0].userInfo?.username || "N/A" : "N/A"
        });
    } catch (err) {
        console.error("❌ Error en getEstadisticas:", err);
        res.status(500).json({ msg: "Error al obtener estadísticas." });
    }
};

// Obtener lista de usuarios con estado y suspensión
const getUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find({}, "username email role estado suspensionHasta");
        res.json(usuarios);
    } catch (err) {
        console.error("❌ Error en getUsuarios:", err);
        res.status(500).json({ msg: "Error al obtener usuarios." });
    }
};

// Actualizar estado de un usuario
const updateUserStatus = async (req, res) => {
    const { id } = req.params; // 🔹 Ahora toma el ID de la URL
    const { estado, suspensionHasta } = req.body;

    try {
        console.log("📌 ID recibido en updateUserStatus:", id); // Debug para confirmar que llega bien

        const usuario = await User.findById(id); // 🔹 Buscar por `id`
        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        // Validar estados permitidos
        const estadosPermitidos = ["Habilitado", "Deshabilitado", "Suspendido"];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ msg: "Estado no válido" });
        }

        // Si es Suspendido, validar fecha
        if (estado === "Suspendido") {
            if (!suspensionHasta) {
                return res.status(400).json({ msg: "Debes proporcionar una fecha de suspensión" });
            }

            const fechaSuspension = new Date(suspensionHasta);
            if (isNaN(fechaSuspension)) {
                return res.status(400).json({ msg: "Fecha de suspensión inválida" });
            }

            usuario.suspensionHasta = fechaSuspension;
        } else {
            usuario.suspensionHasta = null;
        }

        usuario.estado = estado;
        await usuario.save();

        res.json({ msg: "Estado de usuario actualizado", usuario });
    } catch (err) {
        console.error("❌ Error en updateUserStatus:", err);
        res.status(500).json({ msg: "Error al actualizar el estado del usuario." });
    }
};


// Obtener reservas con filtros
const getReservas = async (req, res) => {
    try {
      const { fecha, estado } = req.query;
      const filtro = {};

      if (fecha) filtro.date = fecha;
      if (estado) filtro.status = estado; 

      const reservas = await Turno.find(filtro)
        .populate("user", "username email")
        .populate("cancha", "name")
        .sort({ date: 1 });

      res.json(reservas);
    } catch (err) {
      console.error("❌ Error en getReservas:", err);
      res.status(500).json({ msg: "Error al obtener reservas." });
    }
};

module.exports = {
    getEstadisticas,
    getUsuarios,
    getReservas,
    updateUserStatus // 🔹 Nuevo endpoint agregado
};
