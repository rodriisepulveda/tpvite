import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (token && storedUser) {
      if (storedUser.estado === "Deshabilitado") {
        mostrarAlerta("Cuenta deshabilitada", "Tu cuenta ha sido deshabilitada. Contacta con un administrador.", "error");
        setTimeout(() => logout(), 3000);
      } else if (storedUser.estado === "Suspendido" && new Date(storedUser.suspensionHasta) > new Date()) {
        mostrarAlerta(
          "Cuenta suspendida",
          `Tu cuenta está suspendida hasta el ${new Date(storedUser.suspensionHasta).toLocaleDateString()}.`,
          "warning"
        );
        setTimeout(() => logout(), 3000);
      } else {
        setUser(storedUser);
      }
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 403) {
          mostrarAlerta("Acceso denegado", "Sesión cerrada por restricción de cuenta.", "error");
          setTimeout(() => logout(), 3000);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const isAuthenticated = !!user;

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
