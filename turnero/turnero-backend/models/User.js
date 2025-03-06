const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: [true, "El email es obligatorio"], unique: true }, // 🔹 Asegura que el email es requerido
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  estado: { 
    type: String, 
    enum: ['Habilitado', 'Deshabilitado', 'Suspendido'], 
    default: 'Habilitado' 
  },
  suspensionHasta: { type: Date, default: null } 
}, { timestamps: true });

// Middleware para encriptar la contraseña antes de guardarla
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
