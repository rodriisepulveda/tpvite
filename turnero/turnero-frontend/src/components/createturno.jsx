import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const AdminCreateTurno = () => {
  const [canchas, setCanchas] = useState([]);
  const [selectedCancha, setSelectedCancha] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCanchas = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/canchas');
        setCanchas(res.data);
      } catch (err) {
        toast.error('Error al obtener las canchas');
      } finally {
        setLoading(false);
      }
    };
    fetchCanchas();
  }, []);

  const validateForm = () => {
    if (!selectedCancha) return 'Selecciona una cancha.';
    if (!date) return 'Selecciona una fecha.';
    if (!startTime || !endTime) return 'Selecciona las horas de inicio y fin.';
    if (startTime >= endTime) return 'La hora de inicio debe ser anterior a la de fin.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/turnos`,
        { cancha: selectedCancha, date, startTime, endTime, description },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      toast.success('Turno creado correctamente');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Error al crear el turno');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Crear Turno para una Cancha</h1>
      <form className="card p-4 shadow" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Selecciona una cancha</label>
          <select
            value={selectedCancha}
            onChange={(e) => setSelectedCancha(e.target.value)}
            className="form-select"
          >
            <option value="">-- Seleccionar cancha --</option>
            {canchas.map((cancha) => (
              <option key={cancha._id} value={cancha._id}>
                {cancha.name} - {cancha.location}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Hora de Inicio</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Hora de Fin</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control"
            rows="3"
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Turno'}
        </button>
      </form>
    </div>
  );
};

export default AdminCreateTurno;
