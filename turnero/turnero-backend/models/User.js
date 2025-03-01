const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], required: true },
  estado: { 
    type: String, 
    enum: ['Habilitado', 'Deshabilitado', 'Suspendido'], 
    default: 'Habilitado' 
  },
  suspensionHasta: { type: Date, default: null } // Solo si está suspendido
});

// Middleware para encriptar contraseña
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
