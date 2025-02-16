// models/Cancha.js

const mongoose = require("mongoose");

const HorarioSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
});

// Validación para asegurarnos de que startTime sea menor que endTime
HorarioSchema.path('endTime').validate(function (value) {
  const [startHour, startMinute] = this.startTime.split(':').map(Number);
  const [endHour, endMinute] = value.split(':').map(Number);
  return (endHour > startHour) || (endHour === startHour && endMinute > startMinute);
}, 'endTime debe ser mayor que startTime.');

const CanchaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  precio: { type: Number, required: true },
  horarios: [HorarioSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cancha", CanchaSchema);