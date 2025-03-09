import React, { useState, useEffect } from "react";

// 🔹 Función para obtener la hora en GMT-3
const getHoraGMT3 = () => {
  const ahora = new Date();
  const offsetGMT3 = -3 * 60;
  ahora.setMinutes(ahora.getMinutes() + ahora.getTimezoneOffset() + offsetGMT3);
  return ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const RelojGMT3 = () => {
  const [hora, setHora] = useState(getHoraGMT3());

  useEffect(() => {
    const interval = setInterval(() => {
      setHora(getHoraGMT3());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center", marginBottom: "10px" }}>
      🕒 Hora del sistema (GMT-3): {hora}
    </div>
  );
};

export default RelojGMT3;
