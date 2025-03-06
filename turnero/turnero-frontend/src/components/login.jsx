import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context/authcontext.jsx";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

const Login = () => {
  const [input, setInput] = useState(""); // 🔹 Puede ser email o username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔹 Enviar email si el input tiene "@" (es un email), sino enviar como username
      const data = input.includes("@") ? { email: input, password } : { username: input, password };

      const res = await axios.post("http://localhost:5000/api/auth/login", data);
      const { token, user } = res.data;

      if (user.estado === "Deshabilitado") {
        mostrarAlerta("Cuenta deshabilitada", "Tu cuenta ha sido deshabilitada. Contacta con un administrador.", "error");
        setTimeout(() => logout(), 3000);
        return;
      }

      if (user.estado === "Suspendido" && new Date(user.suspensionHasta) > new Date()) {
        mostrarAlerta(
          "Cuenta suspendida",
          `Tu cuenta está suspendida hasta el ${new Date(user.suspensionHasta).toLocaleDateString()}.`,
          "warning"
        );
        setTimeout(() => logout(), 3000);
        return;
      }

      login(token, user);
      Swal.fire({
        title: `¡Bienvenido ${user.username}!`,
        text: "Redirigiendo...",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      setTimeout(() => navigate("/turnos"), 2000);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          mostrarAlerta("Error de inicio de sesión", "Credenciales incorrectas.", "error");
        } else if (err.response.status === 403) {
          mostrarAlerta("Acceso denegado", err.response.data.msg, "error");
        } else {
          mostrarAlerta("Error", "No se pudo iniciar sesión.", "error");
        }
      } else {
        mostrarAlerta("Error", "No se pudo conectar con el servidor.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (titulo, mensaje, icono) => {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: icono,
      showConfirmButton: false,
      timer: 3000,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent sx={{ textAlign: "center", p: 4 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Iniciar Sesión
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Usuario o Correo Electrónico"
              variant="outlined"
              margin="normal"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, height: 45 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
