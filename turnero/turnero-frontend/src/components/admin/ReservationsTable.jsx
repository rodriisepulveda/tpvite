import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaFileExcel, FaCheckCircle, FaTimesCircle, FaSearch, FaClock } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const ReservationsTable = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ fecha: '', estado: '', search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const reservationsPerPage = 10;

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

      // **🔹 Ordenar para que "Reservado" siempre aparezca primero**
      const reservasOrdenadas = res.data.sort((a, b) => {
        if (a.status === "reservado" && b.status !== "reservado") return -1;
        if (a.status === "cancelado" && b.status !== "cancelado") return 1;
        if (a.status === "concluido" && b.status !== "concluido") return 1;
        return 0;
      });

      setReservas(reservasOrdenadas);
    } catch (err) {
      console.error('❌ Error al obtener las reservas:', err.response?.data || err.message);
      toast.error('Error al obtener las reservas.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reservas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");
    XLSX.writeFile(workbook, "Reservas.xlsx");
  };

  // 🔎 Filtrar por búsqueda
  const filteredReservas = reservas.filter((reserva) =>
    reserva.user?.username.toLowerCase().includes(filters.search.toLowerCase()) ||
    reserva.cancha?.name.toLowerCase().includes(filters.search.toLowerCase())
  );

  // 📌 Paginación: Obtener solo las reservas correspondientes a la página actual
  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservas.slice(indexOfFirstReservation, indexOfLastReservation);

  return (
    <div className="mt-4">
      <h2 className="mb-3">Gestión de Reservas</h2>

      {/* 🔎 Filtros */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label>Fecha:</label>
          <input 
            type="date" 
            className="form-control" 
            name="fecha" 
            value={filters.fecha} 
            onChange={handleFilterChange} 
          />
        </div>
        <div className="col-md-3">
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
            <option value="concluido">Concluido</option>
          </select>
        </div>
        <div className="col-md-4">
          <label>Búsqueda:</label>
          <div className="input-group">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar por usuario o cancha..." 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
            />
            <span className="input-group-text"><FaSearch /></span>
          </div>
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-success w-100" onClick={exportToExcel}>
            <FaFileExcel /> Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table className="table table-striped table-hover">
            <thead className="table-dark sticky-top">
              <tr>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Cancha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {currentReservations.length > 0 ? (
                currentReservations.map((reserva) => {
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
                        <span className={`badge 
                          ${estado === 'cancelado' ? 'bg-danger' : estado === 'concluido' ? 'bg-secondary' : 'bg-success'}`} 
                          title={`Reserva creada el ${fecha}`}
                        >
                          {estado === "cancelado" ? <FaTimesCircle /> 
                            : estado === "concluido" ? <FaClock /> 
                            : <FaCheckCircle />} {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-danger">No hay reservas registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 📌 Paginación con "Anterior" y "Siguiente" */}
      <div className="d-flex justify-content-between mt-3">
        <button 
          className="btn btn-outline-primary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ⬅ Anterior
        </button>
        <span className="align-self-center">Página {currentPage}</span>
        <button 
          className="btn btn-outline-primary"
          disabled={currentPage * reservationsPerPage >= filteredReservas.length}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Siguiente ➡
        </button>
      </div>
    </div>
  );
};

export default ReservationsTable;
