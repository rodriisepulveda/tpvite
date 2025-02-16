import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (username.trim() === '') errors.username = 'El nombre de usuario es obligatorio.';
    if (password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    if (!['admin', 'user'].includes(role)) errors.role = 'El rol debe ser "admin" o "user".';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', { username, password, role });
      toast.success('Registro exitoso');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error('Error al registrarse');
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
              {errors.username && <small className="text-danger">{errors.username}</small>}
            </div>
            <div className="mb-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="form-control"
              />
              {errors.password && <small className="text-danger">{errors.password}</small>}
            </div>
            <div className="mb-3">
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Role (admin/user)"
                className="form-control"
              />
              {errors.role && <small className="text-danger">{errors.role}</small>}
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
