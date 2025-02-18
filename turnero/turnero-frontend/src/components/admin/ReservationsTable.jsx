import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReservationsTable = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ fecha: '', estado: '' });

  useEffect(() => {
    fetchReservas();
  }, [filters]);

  const fetchReservas = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/admin/reservas', {
        headers: { 'x-auth-token': token },
        params: filters,
      });
      setReservas(res.data);
    } catch (err) {
      console.error('❌ Error al obtener las reservas:', err.response?.data || err.message);
      toast.error('Error al obtener las reservas.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="mt-4">
      <h2 className="mb-3">Gestión de Reservas</h2>

      {/* Filtros */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label>Fecha:</label>
          <input 
            type="date" 
            className="form-control" 
            name="fecha" 
            value={filters.fecha} 
            onChange={handleFilterChange} 
          />
        </div>
        <div className="col-md-4">
          <label>Estado:</label>
          <select 
            className="form-control" 
            name="estado" 
            value={filters.estado} 
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            <option value="reservado">Reservado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
        </div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Cancha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length > 0 ? (
              reservas.map((reserva) => {
                // Verifica que los datos sean válidos antes de acceder a ellos
                const fecha = reserva.date ? reserva.date.split("T")[0] : "N/A";
                const startTime = reserva.startTime ? reserva.startTime.split("T")[1]?.slice(0, 5) : "N/A";
                const endTime = reserva.endTime ? reserva.endTime.split("T")[1]?.slice(0, 5) : "N/A";
                const cancha = reserva.cancha?.name || "N/A";
                const usuario = reserva.user?.username || "Desconocido";
                const estado = reserva.status || "Desconocido";

                return (
                  <tr key={reserva._id}>
                    <td>{usuario}</td>
                    <td>{fecha}</td>
                    <td>{startTime} - {endTime}</td>
                    <td>{cancha}</td>
                    <td>
                      <span className={`badge ${estado === 'cancelado' ? 'bg-danger' : 'bg-success'}`}>
                        {estado}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No hay reservas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReservationsTable;
