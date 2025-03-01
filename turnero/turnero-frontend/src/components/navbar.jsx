import React, { useContext } from "react";
import { AuthContext } from "../context/authcontext.jsx";
import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ background: "linear-gradient(to right, #1976d2, #673ab7)" }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="home" onClick={() => navigate("/")}>
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {isAuthenticated && user ? `Bienvenido, ${user.username}` : "Bienvenido, Invitado"}
        </Typography>
        {isAuthenticated ? (
          <>
            <Button color="inherit" onClick={() => navigate("/turnos")}>Reservar</Button>
            <Button color="inherit" onClick={() => navigate("/misreservas")}>Mis Reservas</Button>
            {user?.role === "admin" && (
              <Button color="inherit" onClick={() => navigate("/admin-dashboard")}>Dashboard</Button>
            )}
            <Button color="error" variant="contained" sx={{ ml: 2 }} onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate("/login")}>Iniciar sesión</Button>
            <Button color="inherit" onClick={() => navigate("/register")}>Registrarse</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
