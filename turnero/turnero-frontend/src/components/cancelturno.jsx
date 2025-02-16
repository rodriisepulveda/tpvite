import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './styles/createturno.css';


const CreateTurno = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime || !description) {
      toast.error('Por favor, complete todos los campos');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/turnos`, { title, date, startTime, endTime, description });
      toast.success('Turno creado correctamente');
      navigate('/turnos');
    } catch (err) {
      toast.error('Error al crear el turno');
    }
  };

  return (
    <form className="createturno-form" onSubmit={handleSubmit}>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="createturno-input" />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="createturno-input" />
      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="createturno-input" />
      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="createturno-input" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" className="createturno-textarea"></textarea>
      <button type="submit" className="createturno-button">Crear Turno</button>
    </form>
  );
};

export default CreateTurno;