import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

const getHoraGMT3 = () => {
  const ahora = new Date();
  const offsetGMT3 = -3 * 60;
  ahora.setMinutes(ahora.getMinutes() + ahora.getTimezoneOffset() + offsetGMT3);
  return ahora.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
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
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        mt: 2,
        mb: 2,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 1,
          borderRadius: 2,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
        >
          🕒 Hora del sistema (GMT-3): {hora}
        </Typography>
      </Box>
    </Box>
  );
};

export default RelojGMT3;
