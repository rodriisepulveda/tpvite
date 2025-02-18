import React, { useContext } from 'react';
import { AuthContext } from '../context/authcontext.jsx';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <span className="navbar-text text-light ms-2">
          {isAuthenticated && user ? `Bienvenido, ${user.username}` : 'Bienvenido, Invitado'}
        </span>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="nav-link">
                Inicio
              </a>
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <a href="/turnos" onClick={(e) => { e.preventDefault(); navigate('/turnos'); }} className="nav-link">
                    Reservar
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/misreservas" onClick={(e) => { e.preventDefault(); navigate('/misreservas'); }} className="nav-link">
                    Mis Reservas
                  </a>
                </li>
                {/* Mostrar el Dashboard solo si el usuario es administrador */}
                {user?.role === "admin" && (
                  <li className="nav-item">
                    <a href="/admin-dashboard" onClick={(e) => { e.preventDefault(); navigate('/admin-dashboard'); }} className="nav-link">
                      Dashboard
                    </a>
                  </li>
                )}
                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-outline-light">
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="nav-link">
                    Iniciar sesión
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }} className="nav-link">
                    Registrarse
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
