import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2"; // ✅ Importar SweetAlert
import { AuthContext } from "../context/authcontext.jsx";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { username, password });
      const { token, user } = res.data;

      // 🔹 Verificar si el usuario está suspendido o deshabilitado
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

      // 🔹 Si está habilitado, guardar el usuario y redirigir
      login(token, user);
      Swal.fire({
        title: `¡Bienvenido ${user.username}!`,
        text: "Redirigiendo...",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
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

  // 🔹 Función para mostrar SweetAlert sin botón de aceptar
  const mostrarAlerta = (titulo, mensaje, icono) => {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: icono,
      showConfirmButton: false,
      timer: 3000, // Se cierra automáticamente después de 3 segundos
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  };

  return (
    <section className="vh-100" style={{ backgroundColor: "#508bfc" }}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-2-strong" style={{ borderRadius: "1rem" }}>
              <div className="card-body p-5 text-center">
                <h3 className="mb-5">Iniciar Sesión</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-outline mb-4">
                    <input
                      type="text"
                      id="username"
                      className="form-control form-control-lg"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <label className="form-label" htmlFor="username">
                      Usuario
                    </label>
                  </div>

                  <div className="form-outline mb-4">
                    <input
                      type="password"
                      id="password"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label className="form-label" htmlFor="password">
                      Contraseña
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg btn-block w-100" disabled={loading}>
                    {loading ? "Iniciando sesión..." : "Login"}
                  </button>
                </form>

                <hr className="my-4" />

                <button className="btn btn-lg btn-block btn-danger w-100 mb-2" disabled>
                  <i className="fab fa-google me-2"></i> Iniciar sesión con Google
                </button>
                <button className="btn btn-lg btn-block btn-primary w-100" disabled>
                  <i className="fab fa-facebook-f me-2"></i> Iniciar sesión con Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
