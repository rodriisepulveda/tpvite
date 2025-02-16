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
  
      console.log('Login Response:');
      console.log('Token:', token);
      console.log('User:', user);
  
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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form className="card p-4 shadow" onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="form-control"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
