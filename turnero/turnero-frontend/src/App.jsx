import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./components/home.jsx";
import Login from "./components/login.jsx";
import Register from "./components/register.jsx";
import Turnos from "./components/turnos.jsx";
import CreateTurno from "./components/createturno.jsx";
import CancelTurno from "./components/cancelturno.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import MisReservas from "./components/MisReservas.jsx";
import Navbar from "./components/navbar.jsx";
import { AuthProvider } from "./context/authcontext.jsx";
import ProtectedRoute from "./components/protectedroute.jsx";
import EditarReserva from "./components/EditarReserva.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

import { ThemeProvider, createTheme } from "@mui/material/styles";

// Define el tema. Para el modo oscuro, cambia mode a "dark".
const theme = createTheme({
  palette: {
    mode: "light", // Cambia a "dark" para modo oscuro
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <ToastContainer
            limit={3}
            theme="colored"
            autoClose={3000}
            pauseOnHover={false}
            closeButton
            newestOnTop
            position="top-right"
            style={{
              top: "70px",
              borderRadius: "10px",
            }}
            hideProgressBar={false}
            draggable
          />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/turnos"
              element={
                <ProtectedRoute>
                  <Turnos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-turno"
              element={
                <ProtectedRoute>
                  <CreateTurno />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cancel-turno"
              element={
                <ProtectedRoute>
                  <CancelTurno />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/misreservas"
              element={
                <ProtectedRoute>
                  <MisReservas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editar-reserva/:id"
              element={
                <ProtectedRoute>
                  <EditarReserva />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
