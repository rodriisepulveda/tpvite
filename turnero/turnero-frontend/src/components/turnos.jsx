import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/authcontext.jsx';
import RelojGMT3 from "../components/RelojGMT3"; // Importamos el reloj


// Componentes de Material UI
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  TextField,
  Card,
  CardContent,
  Button,
  Paper
} from '@mui/material';

const Turnos = () => {
  const [canchas, setCanchas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayGMT3());
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Obtiene la fecha de hoy en GMT-3 en formato "YYYY-MM-DD"
  function getTodayGMT3() {
    const now = new Date();
    const offset = -3; // Ajusta según tu zona horaria
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + offset * 60);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Devuelve la hora actual (HH:MM) en GMT-3
  const getCurrentTime = () => {
    const now = new Date();
    const offset = -3;
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + offset * 60);
    return now.toTimeString().slice(0, 5); // "HH:MM"
  };

  // Convierte "YYYY-MM-DD" a un formato local legible (DD/MM/AAAA)
  const formatDateToLocale = (dateString) => {
    const date = new Date(`${dateString}T00:00:00-03:00`);
    return date.toLocaleDateString('es-ES');
  };

  // Obtiene las canchas y sus horarios libres
  const fetchCanchas = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/canchas', {
        headers: { 'x-auth-token': token },
      });

      const currentTime = getCurrentTime();
      const today = getTodayGMT3();

      const horariosLibresPromises = res.data.map(async (cancha) => {
        const horariosRes = await axios.get('http://localhost:5000/api/turnos/libres', {
          params: { date: selectedDate, cancha: cancha._id },
          headers: { 'x-auth-token': token },
        });

        // Filtra horarios pasados solo si la fecha seleccionada es hoy
        const horariosFiltrados = horariosRes.data.filter((horario) => {
          // Si NO es hoy => no filtramos
          if (selectedDate !== today) return true;
          // Si ES hoy => filtramos los que ya pasaron
          return horario.startTime > currentTime;
        });

        return { ...cancha, horariosLibres: horariosFiltrados };
      });

      const canchasConHorariosLibres = await Promise.all(horariosLibresPromises);
      setCanchas(canchasConHorariosLibres);
    } catch (err) {
      console.error('Error al obtener las canchas o los horarios libres:', err);
      toast.error('Error al obtener las canchas o los horarios libres.');
    } finally {
      setLoading(false);
    }
  };

  // Actualiza la lista de canchas cuando cambia la fecha
  useEffect(() => {
    setCanchas([]); // Limpia el estado antes de recargar
    fetchCanchas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, navigate]);

  // Maneja el click en una cancha para mostrar/ocultar horarios
  const handleCanchaClick = (canchaId) => {
    setSelectedCancha(selectedCancha === canchaId ? null : canchaId);
  };

  // Realiza la reserva de un turno
  const handleReserve = async (canchaId, horarioId, canchaName, startTime, endTime) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }

    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Deseas reservar el turno de ${startTime} a ${endTime} en ${canchaName} a nombre de: ${user?.username}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, reservar',
        cancelButtonText: 'Cancelar',
      });

      if (!result.isConfirmed) return;

      setLoading(true);

      await axios.post(
        'http://localhost:5000/api/turnos',
        {
          date: selectedDate,
          startTime,
          endTime,
          title: 'Reserva desde el frontend',
          description: `Reserva en ${canchaName}`,
          cancha: canchaId,
        },
        { headers: { 'x-auth-token': token } }
      );

      toast.success('Turno reservado correctamente.');
      fetchCanchas();
    } catch (err) {
      console.error('Error al reservar el turno:', err.response?.data?.msg || err.message);
      toast.error(err.response?.data?.msg || 'Error al reservar el turno. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Render del componente
  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
        {selectedDate === getTodayGMT3()
          ? 'Canchas disponibles para hoy'
          : 'Canchas disponibles para el día'}
      </Typography>
      <Typography variant="h6" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
        {formatDateToLocale(selectedDate)}
      </Typography>

          {/* Reloj visible en tiempo real */}
<RelojGMT3 />

      {/* Selector de fecha */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          O selecciona la fecha en la que desees reservar
        </Typography>
        <TextField
          type="date"
          value={selectedDate}
          inputProps={{ min: getTodayGMT3() }}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </Box>

      {/* Loading spinner */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          {/* Listado de canchas */}
          {canchas.length > 0 ? (
            canchas.map((cancha) => {
              const isSelected = selectedCancha === cancha._id;
              return (
                <Card
                  key={cancha._id}
                  onClick={() => handleCanchaClick(cancha._id)}
                  sx={{
                    mb: 3,
                    boxShadow: isSelected ? 4 : 1,
                    border: isSelected ? '2px solid' : '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'grey.300',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.01)',
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {cancha.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Precio: {cancha.precio}
                    </Typography>

                    {/* Horarios disponibles si la cancha está seleccionada */}
                    {isSelected && (
                      <Box sx={{ mt: 2 }}>
                        {cancha.horariosLibres.length > 0 ? (
                          <>
                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                              Horarios disponibles para {formatDateToLocale(selectedDate)}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                              }}
                            >
                              {cancha.horariosLibres.map((horario) => (
                                <Paper
                                  key={horario._id}
                                  sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    {horario.startTime} - {horario.endTime}
                                  </Typography>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReserve(
                                        cancha._id,
                                        horario._id,
                                        cancha.name,
                                        horario.startTime,
                                        horario.endTime
                                      );
                                    }}
                                  >
                                    Reservar
                                  </Button>
                                </Paper>
                              ))}
                            </Box>
                          </>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ mt: 2, color: 'error.main', textAlign: 'center' }}
                          >
                            Ya no hay turnos disponibles para este día, intenta reservar para otro día.
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Typography variant="body1" sx={{ color: 'error.main', textAlign: 'center', mt: 3 }}>
              No hay canchas disponibles en este momento.
            </Typography>
          )}
        </>
      )}
    </Container>
  );
};

export default Turnos;
