const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: [true, "El email es obligatorio"], unique: true },
  password: { type: String, required: true }, // 🔹 Ahora se encripta en authRoute.js, no aquí
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  estado: { 
    type: String, 
    enum: ['Habilitado', 'Deshabilitado', 'Suspendido'], 
    default: 'Habilitado' 
  },
  suspensionHasta: { type: Date, default: null } 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
