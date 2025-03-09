import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authcontext.jsx";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import RelojGMT3 from "../components/RelojGMT3"; // Importamos el reloj

// Componentes de Material UI
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
} from "@mui/material";

const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error(
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        );
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:5000/api/turnos/misreservas",
          {
            headers: { "x-auth-token": token },
          }
        );
        setReservas(res.data);
      } catch (err) {
        console.error("Error al obtener las reservas:", err);
        toast.error("Error al obtener las reservas.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [navigate]);

  // Helpers para formatear fecha y hora
  const ajustarFecha = (dateString) => dateString.split("T")[0];
  const obtenerHoraDesdeDB = (dateString) => dateString.slice(11, 16);

  // Función para cancelar reserva
  const handleCancel = async (turnoId) => {
    const token = localStorage.getItem("token");
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción cancelará tu reserva. Esto no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await axios.put(
        `http://localhost:5000/api/turnos/${turnoId}/cancel`,
        {},
        { headers: { "x-auth-token": token } }
      );

      if (res.status === 200) {
        setReservas((prev) =>
          prev.map((r) =>
            r._id === turnoId ? { ...r, status: "cancelado" } : r
          )
        );
        toast.success("Reserva cancelada correctamente.");
      } else {
        toast.error("No se pudo cancelar la reserva. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error al cancelar la reserva:", err);
      toast.error("Error al cancelar la reserva. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Función para editar reserva
  const handleEdit = (turnoId) => navigate(`/editar-reserva/${turnoId}`);

  // Separar las reservas por estado
  const reservasActivas = reservas.filter((r) => r.status === "reservado");
  const reservasCanceladas = reservas.filter((r) => r.status === "cancelado");
  const reservasConcluidas = reservas.filter((r) => r.status === "concluido");

  // Componente auxiliar para renderizar tarjetas
  const RenderReservas = ({ titulo, colorTitulo, lista, esActiva = false }) => (
    <Box sx={{ mt: 6 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, color: colorTitulo || "inherit", fontWeight: "bold" }}
      >
        {titulo}
      </Typography>
      {lista.length > 0 ? (
        lista.map((reserva) => (
          <Card key={reserva._id} sx={{ mb: 4, p: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                {reserva.cancha?.name || "Cancha desconocida"}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", mb: 2 }}
              >
                <strong>Fecha:</strong> {ajustarFecha(reserva.date)} |{" "}
                <strong>Horario:</strong>{" "}
                {obtenerHoraDesdeDB(reserva.startTime)} -{" "}
                {obtenerHoraDesdeDB(reserva.endTime)}
              </Typography>
              {esActiva && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="error"
                    size="medium"
                    sx={{ mr: 2 }}
                    onClick={() => handleCancel(reserva._id)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={() => handleEdit(reserva._id)}
                  >
                    Editar
                  </Button>
                </Box>
              )}
              {!esActiva && reserva.status === "cancelado" && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.disabled", mt: 2 }}
                >
                  <em>Cancelado por el usuario</em>
                </Typography>
              )}
              {!esActiva && reserva.status === "concluido" && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.disabled", mt: 2 }}
                >
                  <em>Turno concluido</em>
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography
          variant="body1"
          align="center"
          sx={{ color: "text.secondary" }}
        >
          No tienes reservas {titulo.toLowerCase()}.
        </Typography>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ mb: 6, fontWeight: "bold" }}
      >
        Mis Reservas
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          {/* Reloj visible en tiempo real */}
          <RelojGMT3 />
          {/* Reservas Activas */}
          <RenderReservas
            titulo="Reservas Activas"
            colorTitulo="primary.main"
            lista={reservasActivas}
            esActiva
          />

          {/* Reservas Canceladas */}
          {reservasCanceladas.length > 0 && (
            <RenderReservas
              titulo="Reservas Canceladas"
              colorTitulo="error.main"
              lista={reservasCanceladas}
            />
          )}

          {/* Reservas Concluidas */}
          {reservasConcluidas.length > 0 && (
            <RenderReservas
              titulo="Reservas Concluidas"
              colorTitulo="success.main"
              lista={reservasConcluidas}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default MisReservas;
