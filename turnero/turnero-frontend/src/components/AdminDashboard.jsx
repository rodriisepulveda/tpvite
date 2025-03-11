import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import RelojGMT3 from "../components/RelojGMT3"; // Importamos el reloj

// Importa los componentes de Material UI
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Grid,
  Fade,
  Slide
} from "@mui/material";

// Importa tus componentes internos
import StatisticsCard from "../components/admin/StatisticsCard";
import ReservationsTable from "../components/admin/ReservationsTable";
import UsersList from "../components/admin/UsersList";

// Importa los íconos (react-icons)
import {
  FaCalendarAlt,
  FaFutbol,
  FaUser,
  FaBan,
  FaCheckCircle,
} from "react-icons/fa";

const AdminDashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/admin/estadisticas", {
          headers: { "x-auth-token": token },
        });

        // Evita mostrar "undefined"
        if (!res.data.totalConcluidas) {
          res.data.totalConcluidas = 0;
        }

        setEstadisticas(res.data);
      } catch (err) {
        console.error("❌ Error al obtener las estadísticas:", err);
        toast.error("Error al obtener las estadísticas.");
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!estadisticas) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: "bold" }}>
          Panel de Administración
        </Typography>
        <Typography variant="body1" color="error" align="center" sx={{ fontWeight: "bold" }}>
          No se pudieron cargar las estadísticas.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Título */}
      <Fade in={true} timeout={600}>
        <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: "bold" }}>
          Panel de Administración
        </Typography>
      </Fade>

      {/* Grid de las tarjetas pequeñas */}
      <Slide in={true} direction="up" timeout={500}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <StatisticsCard
              title="Reservas Activas"
              value={estadisticas.totalReservas || 0}
              icon={<FaCalendarAlt />}
              bgColor="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticsCard
              title="Reservas Canceladas"
              value={estadisticas.totalCanceladas || 0}
              icon={<FaBan />}
              bgColor="error.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticsCard
              title="Reservas Concluidas"
              value={estadisticas.totalConcluidas || 0}
              icon={<FaCheckCircle />}
              bgColor="secondary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticsCard
              title="Usuario Más Activo"
              value={estadisticas.usuarioMasActivo || "N/A"}
              icon={<FaUser />}
              bgColor="warning.main"
            />
          </Grid>
          {/* Tarjeta ancha (abajo) */}
          <Grid item xs={12}>
            <StatisticsCard
              title="Cancha Más Reservada"
              value={estadisticas.canchaMasReservada || "N/A"}
              icon={<FaFutbol />}
              bgColor="success.main"
            />
          </Grid>
        </Grid>
      </Slide>

      {/* Reloj */}
      <Box sx={{ p: 2, textAlign: "center", mt: 3 }}>
        <RelojGMT3 />
      </Box>

      {/* Sección de Reservas */}
      <Slide in={true} direction="up" timeout={500}>
        <Box sx={{ mt: 4 }}>
          <Fade in={true} timeout={500}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Gestión de Reservas
            </Typography>
          </Fade>
          <ReservationsTable />
        </Box>
      </Slide>

      {/* Sección de Usuarios */}
      <Slide in={true} direction="up" timeout={500}>
        <Box sx={{ mt: 4 }}>
          <Fade in={true} timeout={500}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Gestión de Usuarios
            </Typography>
          </Fade>
          <UsersList />
        </Box>
      </Slide>
    </Container>
  );
};

export default AdminDashboard;
