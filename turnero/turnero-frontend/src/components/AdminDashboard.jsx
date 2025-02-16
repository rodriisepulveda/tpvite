import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(false);  // Estado de carga

  useEffect(() => {
    const fetchCanchas = async () => {
      setLoading(true); // Inicia la carga
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No se ha encontrado el token de acceso');
        setLoading(false); // Finaliza la carga
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/api/canchas', {
          headers: { 'x-auth-token': token },
        });
        setCanchas(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Error al obtener las canchas');
      } finally {
        setLoading(false); // Finaliza la carga siempre
      }
    };
    fetchCanchas();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Dashboard del Administrador</h1>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
        </div>
      ) : (
        canchas.map((cancha) => (
          <div key={cancha._id} className="card mb-3 shadow">
            <div className="card-body">
              <h2 className="card-title">{cancha.name}</h2>
              <p className="card-text">Precio: {cancha.precio}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
