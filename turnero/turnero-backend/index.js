const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/authRoute');
const turnoRoutes = require('./routes/turnosRoute');
const canchaRoutes = require('./routes/canchasRoute');

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/turnero', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a la base de datos'))
  .catch((err) => console.error('Falló la conexión a la base de datos', err));

app.use('/api/auth', authRoutes);
app.use('/api/turnos', turnoRoutes); 
app.use('/api/canchas', canchaRoutes);

// Middleware para manejo de errores centralizado
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
