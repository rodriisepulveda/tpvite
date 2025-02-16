import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext.jsx';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/turnos/misreservas', {
          headers: { 'x-auth-token': token },
        });
        console.log('Reservas obtenidas:', res.data);
        setReservas(res.data);
      } catch (err) {
        console.error('Error al obtener las reservas:', err);
        toast.error('Error al obtener las reservas.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [navigate]);

  const ajustarFecha = (dateString) => {
    const date = new Date(dateString);
    return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
  };

  const handleDelete = async (turnoId) => {
    const token = localStorage.getItem('token');
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará tu reserva. Esto no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/turnos/${turnoId}`, {
        headers: { 'x-auth-token': token },
      });
      setReservas((prevReservas) => prevReservas.filter((reserva) => reserva._id !== turnoId));
      toast.success('Reserva eliminada correctamente.');
    } catch (err) {
      console.error('Error al eliminar la reserva:', err);
      toast.error('Error al eliminar la reserva.');
    }
  };

  const handleEdit = (turnoId) => {
    navigate(`/editar-reserva/${turnoId}`);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Mis Reservas</h1>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
        </div>
      ) : reservas.length > 0 ? (
        reservas.map((reserva) => {
          console.log('Reserva actual:', reserva);

          const canchaName =
            typeof reserva.cancha?.name === 'string' ? reserva.cancha.name : 'Cancha desconocida';
          const fechaReserva = reserva.date ? ajustarFecha(reserva.date) : 'Fecha no disponible';
          const horaInicio = typeof reserva.startTime === 'string' ? reserva.startTime : 'Hora de inicio no disponible';
          const horaFin = typeof reserva.endTime === 'string' ? reserva.endTime : 'Hora de fin no disponible';
          const descripcion = typeof reserva.description === 'string' ? reserva.description : 'Sin descripción';

          return (
            <div key={reserva._id} className="card mb-3 shadow">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title">{canchaName}</h5>
                  <p className="card-text">
                    Fecha: {fechaReserva} - Horario: {horaInicio} a {horaFin}
                  </p>
                  <p className="card-text">{descripcion}</p>
                </div>
                <div>
                  <button className="btn btn-outline-danger me-2" onClick={() => handleDelete(reserva._id)}>
                    ❌ Eliminar
                  </button>
                  <button className="btn btn-outline-primary" onClick={() => handleEdit(reserva._id)}>
                    ✏️ Editar
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center">No tienes reservas aún.</p>
      )}
    </div>
  );
};

export default MisReservas;
