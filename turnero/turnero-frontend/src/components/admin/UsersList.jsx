import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

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
} from "@mui/material";

const UsersList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usuariosPorPagina = 5;

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

  // 🔹 Función para modificar un usuario
  const handleEditUser = async (userId, currentData) => {
    const { value: formValues } = await Swal.fire({
      title: "Modificar Usuario",
      html: `
        <label for="swal-username" style="display:block; text-align:left; font-weight:bold;">Nombre:</label>
        <input id="swal-username" class="swal2-input" value="${currentData.username}" placeholder="Ingrese el nombre de usuario">
        
        <label for="swal-email" style="display:block; text-align:left; font-weight:bold; margin-top:10px;">Correo:</label>
        <input id="swal-email" class="swal2-input" value="${currentData.email}" placeholder="Ingrese el correo electrónico">
        
        <label for="swal-role" style="display:block; text-align:left; font-weight:bold; margin-top:10px;">Rol:</label>
        <select id="swal-role" class="swal2-input">
          <option value="user" ${currentData.role === "user" ? "selected" : ""}>Usuario</option>
          <option value="admin" ${currentData.role === "admin" ? "selected" : ""}>Administrador</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          username: document.getElementById("swal-username").value,
          email: document.getElementById("swal-email").value,
          role: document.getElementById("swal-role").value
        };
      }
    });

    if (!formValues) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/admin/usuarios/${userId}`, formValues, {
        headers: { "x-auth-token": token }
      });

      toast.success(`Usuario ${formValues.username} actualizado correctamente`);
      setUsuarios((prev) =>
        prev.map((user) => (user._id === userId ? { ...user, ...formValues } : user))
      );
    } catch (err) {
      console.error("❌ Error al actualizar el usuario:", err);
      toast.error("Error al actualizar el usuario.");
    }
  };

  // 🔹 Función para suspender un usuario
  const handleSuspendUser = async (userId, username) => {
    const { value: tiempo } = await Swal.fire({
      title: "Selecciona la duración de la suspensión",
      html: `
        <select id="suspension-select" class="swal2-input">
          <option value="3">3 días</option>
          <option value="7">1 semana</option>
          <option value="14">2 semanas</option>
          <option value="30">1 mes</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const selectedValue = document.getElementById("suspension-select").value;
        if (!selectedValue) {
          Swal.showValidationMessage("Debes seleccionar un tiempo de suspensión.");
        }
        return selectedValue;
      }
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
                    {usuario.estado !== "Deshabilitado" && (
                      <Grid item>
                        <Button variant="contained" color="error" size="small" onClick={() => handleChangeUserStatus(usuario._id, "Deshabilitado", usuario.username)}>
                          DESHABILITAR
                        </Button>
                      </Grid>
                    )}
                    {usuario.estado === "Habilitado" && (
                      <Grid item>
                        <Button variant="contained" color="warning" size="small" onClick={() => handleSuspendUser(usuario._id, usuario.username)}>
                          SUSPENDER
                        </Button>
                      </Grid>
                    )}
                    <Grid item>
                      <Button variant="contained" color="primary" size="small" onClick={() => handleEditUser(usuario._id, usuario)}>
                        MODIFICAR
                      </Button>
                    </Grid>
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
