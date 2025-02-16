const mongoose = require('mongoose');

const TurnoSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
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
    required: true  // Ahora es obligatorio para asegurar que siempre se asigne un usuario
  },
  cancha: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cancha', 
    required: true 
  }
}, { timestamps: true });  // Agrega createdAt y updatedAt automáticamente

module.exports = mongoose.model('Turno', TurnoSchema);
