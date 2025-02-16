// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log del error en la consola para depuración
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Asegura que no respondamos con un código 200 si hay error
    res.status(statusCode).json({
      msg: err.message || 'Error en el servidor',
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack, // Oculta el stack en producción
    });
  };
  
  module.exports = errorHandler;
  