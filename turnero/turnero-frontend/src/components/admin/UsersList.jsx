import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// Componentes de Material UI
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Grid,
  Pagination,
  Typography
} from '@mui/material';

const UsersList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usuariosPorPagina = 5;

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/admin/usuarios', {
          headers: { 'x-auth-token': token },
        });

        const usuariosProcesados = res.data.map((user) => ({
          ...user,
          _id: typeof user._id === 'object' && user._id.$oid ? user._id.$oid : user._id,
        }));

        setUsuarios(usuariosProcesados);
      } catch (err) {
        console.error('❌ Error al obtener los usuarios:', err);
        toast.error('Error al obtener los usuarios.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  // Función para mostrar SweetAlert y confirmar el cambio de estado
  const confirmarCambioEstado = async (estado, username) => {
    const acciones = {
      Habilitado: 'habilitar',
      Suspendido: 'suspender',
      Deshabilitado: 'deshabilitar',
    };

    const icono = estado === 'Habilitado' ? 'success' : estado === 'Suspendido' ? 'warning' : 'error';
    const accion = acciones[estado];

    return Swal.fire({
      title: `¿Estás seguro de ${accion} a ${username}?`,
      icon: icono,
      showCancelButton: true,
      confirmButtonColor: estado === 'Habilitado' ? '#28a745' : estado === 'Suspendido' ? '#FFEB3B' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
    });
  };

  // Función para actualizar el estado del usuario
  const handleChangeUserStatus = async (userId, estado, username) => {
    const result = await confirmarCambioEstado(estado, username);
    if (!result.isConfirmed) return;

    let suspensionHasta = null;

    if (estado === 'Suspendido') {
      const { value: tiempo } = await Swal.fire({
        title: 'Selecciona la duración de la suspensión',
        input: 'select',
        inputOptions: {
          '3': '3 días',
          '7': '1 semana',
          '14': '2 semanas',
          '30': '1 mes',
        },
        inputPlaceholder: 'Duración de la suspensión',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
      });

      if (!tiempo) return;

      const fechaSuspension = new Date();
      fechaSuspension.setDate(fechaSuspension.getDate() + parseInt(tiempo));
      suspensionHasta = fechaSuspension.toISOString();
    }

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `http://localhost:5000/api/admin/usuarios/${userId}/estado`,
        { estado, suspensionHasta },
        { headers: { 'x-auth-token': token } }
      );

      toast.success(`Usuario ${username} ahora está ${estado}.`);

      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((user) =>
          user._id === userId ? { ...user, estado, suspensionHasta } : user
        )
      );
    } catch (err) {
      console.error('❌ Error al actualizar el estado del usuario:', err);
      toast.error('Error al actualizar el estado del usuario.');
    }
  };

  // Filtrar usuarios según el término de búsqueda
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const nombre = usuario.username?.toLowerCase() || '';
    const email = usuario.email?.toLowerCase() || '';
    return nombre.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  // Paginación
  const usuariosPaginados = usuariosFiltrados.slice(
    (currentPage - 1) * usuariosPorPagina,
    currentPage * usuariosPorPagina
  );

  return (
    <Box sx={{ mt: 4 }}>
      {/* Barra de búsqueda */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar usuario por nombre o email..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
<TableContainer 
  component={Paper} 
  sx={{ 
    maxHeight: 400, 
    boxShadow: 3, // Sombreado similar al de ReservationsTable
    border: '1px solid #e0e0e0', // Borde sutil
    borderRadius: 2, // Bordes redondeados
    backgroundColor: 'white', // Fondo blanco
  }}
>
  <Table stickyHeader>
    {/* Encabezado con fondo azul y texto blanco */}
    <TableHead sx={{ '& .MuiTableCell-head': { backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' } }}>
      <TableRow>
        <TableCell>Nombre</TableCell>
        <TableCell>Email</TableCell>
        <TableCell>Rol</TableCell>
        <TableCell>Estado</TableCell>
        <TableCell>Acciones</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {usuariosPaginados.length > 0 ? (
        usuariosPaginados.map((usuario) => (
          <TableRow key={usuario._id} hover>
            <TableCell>{usuario.username || 'Desconocido'}</TableCell>
            <TableCell>{usuario.email || 'Sin Email'}</TableCell>
            <TableCell>{usuario.role}</TableCell>
            <TableCell>
              <Chip
                label={
                  usuario.estado +
                  (usuario.suspensionHasta
                    ? ` (Hasta ${new Date(usuario.suspensionHasta).toLocaleDateString()})`
                    : '')
                }
                sx={{
                  bgcolor:
                    usuario.estado === 'Habilitado'
                      ? 'success.main'
                      : usuario.estado === 'Deshabilitado'
                      ? 'error.main'
                      : '#FFEB3B',
                  color: usuario.estado === 'Suspendido' ? 'black' : 'white'
                }}
              />
            </TableCell>
            <TableCell>
              <Grid container spacing={1}>
                {usuario.estado !== 'Habilitado' && (
                  <Grid item>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() =>
                        handleChangeUserStatus(usuario._id, 'Habilitado', usuario.username)
                      }
                    >
                      HABILITAR
                    </Button>
                  </Grid>
                )}
                {usuario.estado !== 'Suspendido' && (
                  <Grid item>
                    <Button
                      variant="contained"
                      sx={{ bgcolor: '#FFEB3B', color: 'black' }}
                      size="small"
                      onClick={() =>
                        handleChangeUserStatus(usuario._id, 'Suspendido', usuario.username)
                      }
                    >
                      SUSPENDER
                    </Button>
                  </Grid>
                )}
                {usuario.estado !== 'Deshabilitado' && (
                  <Grid item>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() =>
                        handleChangeUserStatus(usuario._id, 'Deshabilitado', usuario.username)
                      }
                    >
                      DESHABILITAR
                    </Button>
                  </Grid>
                )}
              </Grid>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={5} align="center">
            <Typography color="error" fontWeight="bold">
              No hay usuarios registrados.
            </Typography>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>

          {usuariosFiltrados.length > usuariosPorPagina && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={Math.ceil(usuariosFiltrados.length / usuariosPorPagina)}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default UsersList;