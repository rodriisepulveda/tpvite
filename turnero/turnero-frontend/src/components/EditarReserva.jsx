import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Componentes de Material UI
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel
} from "@mui/material";

// Función para formatear fecha sin zona horaria
const parseDateWithoutTimezone = (dateString) => {
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${year}-${month}-${day}`;
};

// Función para formatear horario a HH:mm
const formatHora = (isoString) => isoString.slice(11, 16);

const EditarReserva = () => {
  const [reserva, setReserva] = useState(null);
  const [turnosLibres, setTurnosLibres] = useState([]);
  const [selectedTurno, setSelectedTurno] = useState("");
  const [loading, setLoading] = useState(false);
  const [fechaNueva, setFechaNueva] = useState(
    parseDateWithoutTimezone(new Date().toISOString())
  );
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReserva = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/turnos/id/${id}`, {
          headers: { "x-auth-token": token },
        });
        const reservaData = res.data;
        reservaData.date = parseDateWithoutTimezone(reservaData.date);
        setReserva(reservaData);
        fetchTurnosLibres(reservaData.date, reservaData.cancha._id);
      } catch (err) {
        console.error("Error al obtener la información de la reserva:", err);
        toast.error("Error al obtener la información de la reserva.");
      } finally {
        setLoading(false);
      }
    };

    fetchReserva();
  }, [id, navigate]);

  const fetchTurnosLibres = async (fecha, canchaId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/turnos/libres", {
        params: { date: fecha, cancha: canchaId },
        headers: { "x-auth-token": token },
      });
      setTurnosLibres(res.data);
    } catch (err) {
      console.error("Error al obtener los turnos libres:", err);
      toast.error("Error al obtener los turnos libres.");
    }
  };

  const handleUpdate = async () => {
    if (!selectedTurno) {
      toast.error("Por favor selecciona un turno para continuar.");
      return;
    }

    const token = localStorage.getItem("token");
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esto actualizará tu reserva con el nuevo horario.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(
        `http://localhost:5000/api/turnos/${id}`,
        {
          date: fechaNueva,
          startTime: selectedTurno.startTime,
          endTime: selectedTurno.endTime,
          cancha: reserva.cancha._id,
        },
        { headers: { "x-auth-token": token } }
      );
      toast.success("Reserva actualizada correctamente.");
      navigate("/misreservas");
    } catch (err) {
      console.error("Error al actualizar la reserva:", err.response?.data || err.message);
      toast.error("Error al actualizar la reserva.");
    }
  };

  const minFecha = reserva ? reserva.date : fechaNueva;

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress color="primary" />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: "bold" }}>
        Editar Reserva
      </Typography>
      {reserva ? (
        <Card sx={{ p: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main", mb: 2 }}>
              Reserva Actual
            </Typography>
            <Typography variant="body1">
              <strong>Cancha:</strong> {reserva.cancha?.name || "Desconocida"}
            </Typography>
            <Typography variant="body1">
              <strong>Fecha:</strong> {reserva.date}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              <strong>Horario:</strong> {formatHora(reserva.startTime)} a {formatHora(reserva.endTime)}
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Selecciona un nuevo turno
            </Typography>
            {turnosLibres.length > 0 ? (
              <FormControl component="fieldset" sx={{ mb: 3, width: "100%" }}>
                <RadioGroup
                  name="turno"
                  value={selectedTurno ? selectedTurno._id : ""}
                  onChange={(e) => {
                    const turno = turnosLibres.find((t) => t._id === e.target.value);
                    setSelectedTurno(turno);
                  }}
                >
                  {turnosLibres.map((turno) => (
                    <FormControlLabel
                      key={turno._id}
                      value={turno._id}
                      control={<Radio />}
                      label={`${turno.startTime} a ${turno.endTime}`}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            ) : (
              <Typography variant="body1" sx={{ color: "error.main", mb: 3 }}>
                No hay turnos disponibles para esta fecha.
              </Typography>
            )}

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Reagendar otro día
            </Typography>
            <TextField
              type="date"
              value={fechaNueva}
              inputProps={{ min: minFecha }}
              onChange={(e) => {
                setFechaNueva(e.target.value);
                fetchTurnosLibres(e.target.value, reserva.cancha._id);
              }}
              fullWidth
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleUpdate}
              disabled={!selectedTurno}
            >
              Actualizar Reserva
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body1" align="center">
          Cargando información de la reserva...
        </Typography>
      )}
    </Container>
  );
};

export default EditarReserva;
