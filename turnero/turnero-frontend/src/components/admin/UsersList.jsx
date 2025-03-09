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

  // 🔹 Función para cambiar el estado del usuario
  const handleChangeUserStatus = async (userId, estado, username) => {
    const confirmacion = await Swal.fire({
      title: `¿Seguro que deseas cambiar el estado de ${username}?`,
      text: `El estado será cambiado a "${estado}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cambiar estado"
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/usuarios/${userId}/estado`,
        { estado },
        { headers: { "x-auth-token": token } }
      );

      toast.success(`Usuario ${username} ahora está ${estado}.`);
      setUsuarios((prev) =>
        prev.map((user) => (user._id === userId ? { ...user, estado } : user))
      );
    } catch (err) {
      console.error("❌ Error al actualizar el estado del usuario:", err);
      toast.error("Error al actualizar el estado del usuario.");
    }
  };

  // 🔹 Filtrar usuarios
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const nombre = usuario.username?.toLowerCase() || "";
    const email = usuario.email?.toLowerCase() || "";
    return nombre.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  // 🔹 Paginación
  const usuariosPaginados = usuariosFiltrados.slice(
    (currentPage - 1) * usuariosPorPagina,
    currentPage * usuariosPorPagina
  );

  return (
    <Box sx={{ mt: 4 }}>
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
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
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
                {usuariosPaginados.length > 0 ? (
                  usuariosPaginados.map((usuario) => (
                    <TableRow key={usuario._id} hover>
                      <TableCell>{usuario.username || "Desconocido"}</TableCell>
                      <TableCell>{usuario.email || "Sin Email"}</TableCell>
                      <TableCell>{usuario.role}</TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.estado}
                          color={usuario.estado === "Deshabilitado" ? "error" : "primary"}
                        />
                      </TableCell>
                      <TableCell>
                        <Grid container spacing={1}>
                          <Grid item>
                            <Button variant="contained" color="primary" size="small" onClick={() => handleEditUser(usuario._id, usuario)}>
                              MODIFICAR
                            </Button>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No hay usuarios registrados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default UsersList;
