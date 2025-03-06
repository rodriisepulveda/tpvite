import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // 🔹 Nuevo campo email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", { 
        username, 
        email, // 🔹 Enviamos el email al backend
        password, 
        role: "user" 
      });

      Swal.fire({
        title: "Registro exitoso",
        text: "Redirigiendo al inicio de sesión...",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      Swal.fire({
        title: "Error en el registro",
        text: err.response?.data?.msg || "No se pudo completar el registro.",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8} display="flex" flexDirection="column" alignItems="center">
        <Card sx={{ width: "100%", p: 3, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Registrarse
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField 
                fullWidth 
                label="Elegi tu nombre de usuario" 
                margin="normal" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
              <TextField 
                fullWidth 
                label="Correo electrónico" 
                type="email" 
                margin="normal" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <TextField 
                fullWidth 
                label="Contraseña" 
                type="password" 
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
                sx={{ mt: 2 }} 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Registrarse"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Register;
