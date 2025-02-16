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
import EditarReserva from './components/EditarReserva.jsx'; // Importa el componente de edición
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          limit={3}
          autoClose={3000}
          pauseOnHover={false}
          closeButton={false}
          newestOnTop
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
          />{" "}
          {/* Nueva ruta */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
