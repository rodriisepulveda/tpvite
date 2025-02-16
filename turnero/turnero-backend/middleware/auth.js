const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    console.log('🔴 No token provided');
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded.user || decoded;
    
    if (process.env.DEBUG_AUTH === 'true') {
      console.log('🟢 Token validado:', req.user);
    }
    
    next();
  } catch (err) {
    console.error('❌ Token no válido:', err.message);
    res.status(401).json({ msg: 'Token no válido' });
  }
};
