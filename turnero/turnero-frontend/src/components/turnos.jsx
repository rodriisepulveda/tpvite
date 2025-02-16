import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/turnos.css';
import { AuthContext } from '../context/authcontext.jsx';

const Turnos = () => {
  const [canchas, setCanchas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayGMT3());
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  function getTodayGMT3() {
    const now = new Date();
    const offset = -3;
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + offset * 60);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const formatDateToLocale = (dateString) => {
    const date = new Date(`${dateString}T00:00:00-03:00`);
    return date.toLocaleDateString('es-ES');
  };

  const fetchCanchas = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }
  
    try {
      const res = await axios.get(`http://localhost:5000/api/canchas`, {
        headers: { 'x-auth-token': token },
      });
  
      const horariosLibresPromises = res.data.map(async (cancha) => {
        const horariosRes = await axios.get(`http://localhost:5000/api/turnos/libres`, {
          params: { date: selectedDate, cancha: cancha._id },
          headers: { 'x-auth-token': token },
        });
        return { ...cancha, horariosLibres: horariosRes.data };
      });
  
      const canchasConHorariosLibres = await Promise.all(horariosLibresPromises);
      setCanchas(canchasConHorariosLibres);
    } catch (err) {
      console.error('Error al obtener las canchas o los horarios libres:', err);
      toast.error('Error al obtener las canchas o los horarios libres.');
    } finally {
      setLoading(false);
    }
  };
  ;

  useEffect(() => {
    fetchCanchas();
  }, [selectedDate, navigate]);

  const handleCanchaClick = (canchaId) => {
    setSelectedCancha(selectedCancha === canchaId ? null : canchaId);
  };

  const handleReserve = async (canchaId, horarioId, canchaName, startTime, endTime) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }
  
    try {
      // Verificar si el usuario ya tiene una reserva en esta cancha
      const reservasExistentes = await axios.get(`http://localhost:5000/api/turnos/misreservas`, {
        headers: { 'x-auth-token': token },
      });
  
      const reservaEnMismaCancha = reservasExistentes.data.find(
        (reserva) => reserva.cancha._id === canchaId
      );
  
      if (reservaEnMismaCancha) {
        const result = await Swal.fire({
          title: 'Ya tienes una reserva en esta cancha',
          text: '¿Deseas reservar de todos modos?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, reservar',
          cancelButtonText: 'Cancelar',
        });
  
        if (!result.isConfirmed) return;
      }
  
      // Proceso de reserva normal
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Deseas reservar el turno de ${startTime} a ${endTime} en ${canchaName} a nombre de: ${user?.username}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, reservar',
        cancelButtonText: 'Cancelar',
      });
  
      if (!result.isConfirmed) return;
  
      setLoading(true);
  
      await axios.post(
        `http://localhost:5000/api/turnos`,
        {
          date: selectedDate,
          startTime,
          endTime,
          title: 'Reserva desde el frontend',
          description: `Reserva en ${canchaName}`,
          cancha: canchaId,
        },
        { headers: { 'x-auth-token': token } }
      );
  
      toast.success('Turno reservado correctamente.');
      fetchCanchas();
    } catch (err) {
      console.error('Error al reservar el turno:', err.response?.data?.msg || err.message);
      toast.error(err.response?.data?.msg || 'Error al reservar el turno. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">
        Canchas disponibles para {selectedDate === getTodayGMT3() ? 'hoy' : 'el día'}
      </h1>
      <h2 className="text-center mb-4">{formatDateToLocale(selectedDate)}</h2>
      <div className="mb-4 text-center">
        <p>O selecciona la fecha en la que desees</p>
        <input
          type="date"
          value={selectedDate}
          min={getTodayGMT3()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="form-control"
        />
      </div>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
        </div>
      ) : (
        canchas.map((cancha) => (
          <div key={cancha._id} className={`card mb-3 shadow ${selectedCancha === cancha._id ? 'border-primary' : ''}`} onClick={() => handleCanchaClick(cancha._id)}>
            <div className="card-body">
              <h2 className="card-title">{cancha.name}</h2>
              <p className="card-text">Precio: {cancha.precio}</p>
              {selectedCancha === cancha._id && (
                <div className="mt-3">
                  <h3>Horarios disponibles para {formatDateToLocale(selectedDate)}</h3>
                  <div className="d-flex flex-wrap">
                    {cancha.horariosLibres.map((horario) => (
                      <div key={horario._id} className="card m-2 p-2">
                        <p className="card-text">
                          {horario.startTime} a {horario.endTime}
                        </p>
                        {horario.usuario ? (
                          <p className="card-text text-danger">Reservado</p>
                        ) : (
                          <button
                            className="btn btn-success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReserve(cancha._id, horario._id, cancha.name, horario.startTime, horario.endTime);
                            }}
                          >
                            Reservar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Turnos;
