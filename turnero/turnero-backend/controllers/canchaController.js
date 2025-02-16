const Cancha = require('../models/Cancha');

exports.createCancha = async (req, res, next) => {
  const { name, description, location, precio } = req.body;
  try {
    const newCancha = new Cancha({ name, description, location, precio });
    const cancha = await newCancha.save();
    res.json(cancha);
  } catch (err) {
    next(err);
  }
};

exports.getAllCanchas = async (req, res, next) => {
  try {
    const canchas = await Cancha.find();
    res.json(canchas);
  } catch (err) {
    next(err);
  }
};

exports.updateCancha = async (req, res, next) => {
  const { name, description, location, precio } = req.body;
  try {
    let cancha = await Cancha.findById(req.params.id);
    if (!cancha) return res.status(404).json({ msg: 'Cancha no encontrada' });

    cancha.name = name;
    cancha.description = description;
    cancha.location = location;
    cancha.precio = precio;
    await cancha.save();
    res.json(cancha);
  } catch (err) {
    next(err);
  }
};

exports.deleteCancha = async (req, res, next) => {
  try {
    let cancha = await Cancha.findById(req.params.id);
    if (!cancha) return res.status(404).json({ msg: 'Cancha no encontrada' });

    await cancha.remove();
    res.json({ msg: 'Cancha eliminada' });
  } catch (err) {
    next(err);
  }
};

exports.reserveTurno = async (req, res) => {
  const { canchaId, horarioId } = req.params;
  const userId = req.user.id;

  try {
    const cancha = await Cancha.findById(canchaId);
    if (!cancha) return res.status(404).json({ msg: 'Cancha no encontrada' });

    const horario = cancha.horarios.id(horarioId);
    if (!horario) {
      return res.status(404).json({ msg: 'Horario no encontrado' });
    }

    if (horario.usuario) {
      return res.status(400).json({ msg: 'Este horario ya está reservado.' });
    }

    horario.usuario = userId;
    cancha.markModified('horarios'); // Marca el array de horarios como modificado
    await cancha.save({ validateModifiedOnly: true }); // Valida solo las propiedades modificadas

    res.json({ msg: 'Turno reservado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
};


exports.cancelTurno = async (req, res, next) => {
  const { canchaId, horarioId } = req.params;

  try {
    const cancha = await Cancha.findById(canchaId);
    const horario = cancha.horarios.id(horarioId);

    if (!horario) {
      return res.status(404).json({ msg: 'Horario no encontrado' });
    }

    horario.usuario = null;
    await cancha.save();

    res.json({ msg: 'Turno cancelado correctamente' });
  } catch (err) {
    next(err);
  }
};
