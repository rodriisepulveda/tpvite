module.exports = (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ msg: "Acceso denegado: No hay usuario autenticado" });
    }
  
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Acceso denegado: No eres administrador" });
    }
  
    next(); // Si es admin, continúa con la petición
  };
  