const mongoose = require('mongoose');

const TurnoSchema = new mongoose.Schema({
  date: { type: Date, required: true }, // Fecha del turno (ej. 2025-02-16)
  startTime: { type: Date, required: true }, // Fecha completa con hora de inicio (ej. 2025-02-16T14:00:00Z)
  endTime: { type: Date, required: true },   // Fecha completa con hora de fin (ej. 2025-02-16T15:30:00Z)
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['disponible', 'reservado', 'cancelado'], 
    default: 'disponible' 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  cancha: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cancha', 
    required: true 
  }
}, { timestamps: true });

// Índice compuesto para evitar turnos duplicados en la misma fecha, horario y cancha
TurnoSchema.index({ date: 1, startTime: 1, cancha: 1 }, { unique: true });

module.exports = mongoose.model('Turno', TurnoSchema);
