// 🔹 Devuelve la hora actual en GMT-3
const getGMT3Date = () => {
    const ahora = new Date();
    const offsetGMT3 = -3 * 60; // Convertir GMT-3 a minutos
    ahora.setMinutes(ahora.getMinutes() + ahora.getTimezoneOffset() + offsetGMT3);
    return ahora;
  };
  
  module.exports = getGMT3Date;
  