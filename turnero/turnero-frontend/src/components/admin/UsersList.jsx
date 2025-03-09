import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Componentes de Material UI
import {
  Box,
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
  Grid
} from "@mui/material";

const UsersList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/admin/usuarios", {
        headers: { "x-auth-token": token }
      });

      setUsuarios(res.data);
    } catch (err) {
      console.error("❌ Error al obtener los usuarios:", err);
      toast.error("Error al obtener los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Función para cambiar el estado del usuario (Habilitar/Deshabilitar)
  const handleChangeUserStatus = async (userId, nuevoEstado, username) => {
    const confirmacion = await Swal.fire({
      title: `¿${nuevoEstado === "Habilitado" ? "Habilitar" : "Deshabilitar"} a ${username}?`,
      text: `El usuario será ${nuevoEstado === "Habilitado" ? "habilitado" : "deshabilitado"}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: nuevoEstado === "Habilitado" ? "#28a745" : "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Sí, ${nuevoEstado === "Habilitado" ? "habilitar" : "deshabilitar"}`
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/usuarios/${userId}/estado`,
        { estado: nuevoEstado },
        { headers: { "x-auth-token": token } }
      );

      toast.success(`Usuario ${username} ahora está ${nuevoEstado}.`);
      fetchUsuarios();
    } catch (err) {
      console.error("❌ Error al actualizar el estado del usuario:", err);
      toast.error("Error al actualizar el estado del usuario.");
    }
  };

  // 🔹 Función para suspender un usuario con duración
  const handleSuspendUser = async (userId, username) => {
    const { value: tiempo } = await Swal.fire({
      title: "Selecciona la duración de la suspensión",
      input: "select",
      inputOptions: {
        "3": "3 días",
        "7": "1 semana",
        "14": "2 semanas",
        "30": "1 mes"
      },
      inputPlaceholder: "Duración de la suspensión",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!tiempo) return;

    const confirmacion = await Swal.fire({
      title: `¿Suspender a ${username}?`,
      text: `El usuario será suspendido por ${tiempo} días.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FFEB3B",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, suspender"
    });

    if (!confirmacion.isConfirmed) return;

    const fechaSuspension = new Date();
    fechaSuspension.setDate(fechaSuspension.getDate() + parseInt(tiempo));

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/usuarios/${userId}/estado`,
        { estado: "Suspendido", suspensionHasta: fechaSuspension.toISOString() },
        { headers: { "x-auth-token": token } }
      );

      toast.success(`Usuario ${username} suspendido por ${tiempo} días.`);
      fetchUsuarios();
    } catch (err) {
      console.error("❌ Error al suspender al usuario:", err);
      toast.error("Error al suspender al usuario.");
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <TableContainer component={Paper} sx={{ maxHeight: 400, boxShadow: 3 }}>
        <Table stickyHeader>
          <TableHead sx={{ "& .MuiTableCell-head": { backgroundColor: "#1976d2", color: "white", fontWeight: "bold" } }}>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario._id} hover>
                <TableCell>{usuario.username}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.role}</TableCell>
                <TableCell>
                  <Chip
                    label={usuario.estado}
                    sx={{
                      bgcolor:
                        usuario.estado === "Habilitado"
                          ? "success.main"
                          : usuario.estado === "Deshabilitado"
                          ? "error.main"
                          : "warning.main",
                      color: "white",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Grid container spacing={1}>
                    {/* Si el usuario está suspendido o deshabilitado, mostrar "Habilitar" */}
                    {(usuario.estado === "Suspendido" || usuario.estado === "Deshabilitado") && (
                      <Grid item>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleChangeUserStatus(usuario._id, "Habilitado", usuario.username)}
                        >
                          HABILITAR
                        </Button>
                      </Grid>
                    )}
                    {/* Si está habilitado, mostrar botón de suspensión */}
                    {usuario.estado === "Habilitado" && (
                      <Grid item>
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          onClick={() => handleSuspendUser(usuario._id, usuario.username)}
                        >
                          SUSPENDER
                        </Button>
                      </Grid>
                    )}
                    {/* Si no está deshabilitado, mostrar botón de deshabilitar */}
                    {usuario.estado !== "Deshabilitado" && usuario.estado !== "Suspendido" && (
                      <Grid item>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleChangeUserStatus(usuario._id, "Deshabilitado", usuario.username)}
                        >
                          DESHABILITAR
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UsersList;
