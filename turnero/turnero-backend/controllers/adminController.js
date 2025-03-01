const mongoose = require("mongoose");
const Turno = require("../models/Turno");
const User = require("../models/User");
const Cancha = require("../models/Cancha");

const getEstadisticas = async (req, res) => {
    try {
        const totalReservas = await Turno.countDocuments({ status: "reservado" });
        const totalCanceladas = await Turno.countDocuments({ status: "cancelado" });
        const totalConcluidas = await Turno.countDocuments({ status: "concluido" }); // 🔹 Se agrega el conteo de concluidas

        // Cancha más reservada
        const canchaMasReservada = await Turno.aggregate([
            { $match: { status: "reservado" } }, // Solo contar reservas activas
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
            { $match: { status: "reservado" } }, // Solo contar reservas activas
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
            totalConcluidas, // 🔹 Ahora se incluye correctamente en la respuesta
            canchaMasReservada: canchaMasReservada.length > 0 ? canchaMasReservada[0].canchaInfo?.name || "N/A" : "N/A",
            usuarioMasActivo: usuarioMasActivo.length > 0 ? usuarioMasActivo[0].userInfo?.username || "N/A" : "N/A"
        });
    } catch (err) {
        console.error("❌ Error en getEstadisticas:", err);
        res.status(500).json({ msg: "Error al obtener estadísticas." });
    }
};

const getUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find({}, "username email role bloqueado");
        res.json(usuarios);
    } catch (err) {
        console.error("❌ Error en getUsuarios:", err);
        res.status(500).json({ msg: "Error al obtener usuarios." });
    }
};

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
};
