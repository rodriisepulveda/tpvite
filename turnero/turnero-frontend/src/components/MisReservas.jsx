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
    return dateString.split('T')[0]; // Extrae solo la fecha exacta sin cambios de zona horaria
  };

  const obtenerHoraDesdeDB = (dateString) => {
    return dateString.slice(11, 16); // Extrae HH:MM directamente del string ISO sin modificarlo
  };

  const handleCancel = async (turnoId) => {
    const token = localStorage.getItem('token');
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción cancelará tu reserva. Esto no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(`http://localhost:5000/api/turnos/${turnoId}/cancel`, {}, {
        headers: { 'x-auth-token': token },
      });

      setReservas((prevReservas) =>
        prevReservas.map((reserva) =>
          reserva._id === turnoId ? { ...reserva, status: "cancelado" } : reserva
        )
      );

      toast.success('Reserva cancelada correctamente.');
    } catch (err) {
      console.error('Error al cancelar la reserva:', err);
      toast.error('Error al cancelar la reserva.');
    }
  };

  const handleEdit = (turnoId) => {
    navigate(`/editar-reserva/${turnoId}`);
  };

  const ahora = Date.now(); // Hora exacta del sistema local

  const reservasActivas = reservas.filter((reserva) => {
    const fechaReserva = ajustarFecha(reserva.date);
    const horaFinReserva = Date.parse(reserva.endTime); // Obtiene la hora exacta en milisegundos
    return reserva.status === "reservado" && (fechaReserva > ajustarFecha(new Date().toISOString()) || horaFinReserva > ahora);
  });

  const reservasCanceladas = reservas.filter((reserva) => reserva.status === "cancelado");

  const reservasConcluidas = reservas.filter((reserva) => {
    const fechaReserva = ajustarFecha(reserva.date);
    const horaFinReserva = Date.parse(reserva.endTime);
    return reserva.status === "reservado" && fechaReserva === ajustarFecha(new Date().toISOString()) && horaFinReserva <= ahora;
  });

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Mis Reservas</h1>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Reservas Activas */}
          <h3>Reservas Activas</h3>
          {reservasActivas.length > 0 ? (
            reservasActivas.map((reserva) => (
              <div key={reserva._id} className="card mb-3 shadow">
                <div className="card-body">
                  <h5 className="card-title">{reserva.cancha?.name || 'Cancha desconocida'}</h5>
                  <p className="card-text">
                    Fecha: {ajustarFecha(reserva.date)} - Horario: {obtenerHoraDesdeDB(reserva.startTime)} a {obtenerHoraDesdeDB(reserva.endTime)}
                  </p>
                  <button className="btn btn-outline-danger me-2" onClick={() => handleCancel(reserva._id)}>❌ Cancelar</button>
                  <button className="btn btn-outline-primary" onClick={() => handleEdit(reserva._id)}>✏️ Editar</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No tienes reservas activas.</p>
          )}

          {/* Reservas Canceladas */}
          {reservasCanceladas.length > 0 && (
            <>
              <h3 className="mt-4 text-danger">Reservas Canceladas</h3>
              {reservasCanceladas.map((reserva) => (
                <div key={reserva._id} className="card mb-3 shadow bg-light">
                  <div className="card-body">
                    <h5 className="card-title text-muted">{reserva.cancha?.name}</h5>
                    <p className="card-text text-muted">
                      Fecha: {ajustarFecha(reserva.date)} - Horario: {obtenerHoraDesdeDB(reserva.startTime)} a {obtenerHoraDesdeDB(reserva.endTime)}
                    </p>
                    <p className="card-text text-muted">Cancelado por el usuario</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Reservas Concluidas */}
          {reservasConcluidas.length > 0 && (
            <>
              <h3 className="mt-4 text-success">Reservas Concluidas</h3>
              {reservasConcluidas.map((reserva) => (
                <div key={reserva._id} className="card mb-3 shadow bg-light">
                  <div className="card-body">
                    <h5 className="card-title text-muted">{reserva.cancha?.name}</h5>
                    <p className="card-text text-muted">
                      Fecha: {ajustarFecha(reserva.date)} - Horario: {obtenerHoraDesdeDB(reserva.startTime)} a {obtenerHoraDesdeDB(reserva.endTime)}
                    </p>
                    <p className="card-text text-muted">Turno concluido</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MisReservas;
