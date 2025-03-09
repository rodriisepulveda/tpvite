import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaFileExcel, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import * as XLSX from 'xlsx';

// Importaciones de Material UI
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Pagination,
  useTheme
} from '@mui/material';

const ReservationsTable = () => {
  const theme = useTheme(); // Para usar la paleta de colores del tema

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ fecha: '', estado: '', search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const reservasPorPagina = 10;

  useEffect(() => {
    fetchReservas();
    // Reinicia la paginación cuando cambian los filtros
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchReservas = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/admin/reservas', {
        headers: { 'x-auth-token': token },
        params: filters,
      });
      setReservas(res.data);
    } catch (err) {
      console.error('❌ Error al obtener las reservas:', err.response?.data || err.message);
      toast.error('Error al obtener las reservas.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const exportToExcel = () => {
    if (!reservas || reservas.length === 0) {
      toast.warn('No hay reservas para exportar.');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(reservas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservas');
    XLSX.writeFile(workbook, 'Reservas.xlsx');
  };

  // Función auxiliar para asignar color según el estado
  const getEstadoColor = (estado) => {
    if (estado === 'cancelado') return theme.palette.error.main;     // rojo
    if (estado === 'concluido') return theme.palette.grey[600];      // gris
    return theme.palette.success.main;                               // verde (para 'reservado' u otros)
  };

  // Paginación de reservas
  const reservasPaginadas = reservas.slice(
    (currentPage - 1) * reservasPorPagina,
    currentPage * reservasPorPagina
  );

  // Helper para formatear la hora en formato 24hs
  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      {/* Sección de filtros */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              label="Fecha"
              name="fecha"
              variant="outlined"
              value={filters.fecha}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Estado"
              name="estado"
              variant="outlined"
              value={filters.estado}
              onChange={handleFilterChange}
              fullWidth
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="reservado">Reservado</MenuItem>
              <MenuItem value="cancelado">Cancelado</MenuItem>
              <MenuItem value="concluido">Concluido</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              type="text"
              label="Buscar usuario o cancha"
              name="search"
              variant="outlined"
              value={filters.search}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              color="success"
              startIcon={<FaFileExcel />}
              onClick={exportToExcel}
              sx={{ height: '100%' }}
              fullWidth
            >
              Exportar
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Tabla de Reservas */}
      <TableContainer component={Paper} elevation={3} sx={{ position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              zIndex: 10,
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        )}
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Horario</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cancha</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservasPaginadas.length > 0 ? (
              reservasPaginadas.map((reserva) => {
                const fecha = reserva.date ? reserva.date.split('T')[0] : 'N/A';
                const startTime = reserva.startTime ? formatTime(reserva.startTime) : 'N/A';
                const endTime = reserva.endTime ? formatTime(reserva.endTime) : 'N/A';
                const cancha = reserva.cancha?.name || 'N/A';
                const usuario = reserva.user?.username || 'Desconocido';
                const estado = reserva.status || 'Desconocido';

                return (
                  <TableRow key={reserva._id}>
                    <TableCell>{usuario}</TableCell>
                    <TableCell>{fecha}</TableCell>
                    <TableCell>{startTime} - {endTime}</TableCell>
                    <TableCell>{cancha}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: getEstadoColor(estado),
                          fontWeight: 'bold',
                        }}
                      >
                        {estado === 'cancelado' ? (
                          <FaTimesCircle />
                        ) : estado === 'concluido' ? (
                          <FaClock />
                        ) : (
                          <FaCheckCircle />
                        )}
                        &nbsp; {estado.charAt(0).toUpperCase() + estado.slice(1)}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'error.main', fontWeight: 'bold' }}>
                  No hay reservas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {reservas.length > reservasPorPagina && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(reservas.length / reservasPorPagina)}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ReservationsTable;
