import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/authcontext.jsx';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      const { token, user } = res.data;
  
      if (token && user) {
        login(token, user);
        toast.success(`¡Bienvenido ${user.username}!`);
        navigate('/turnos');
      } else {
        toast.error('Error al iniciar sesión. Intenta nuevamente.');
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        toast.error('Credenciales incorrectas. Por favor verifica tu usuario y contraseña.');
      } else {
        toast.error('Error en el servidor. Intenta de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
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
                    <label className="form-label" htmlFor="username">Usuario</label>
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
                    <label className="form-label" htmlFor="password">Contraseña</label>
                  </div>

                  <div className="form-check d-flex justify-content-start mb-4">
                    <input className="form-check-input" type="checkbox" id="rememberMe" />
                    <label className="form-check-label ms-2" htmlFor="rememberMe">
                      Recordar contraseña
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg btn-block w-100" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Login'}
                  </button>
                </form>

                <hr className="my-4" />

                {/* Botones para futuros logins con Google y Facebook */}
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
