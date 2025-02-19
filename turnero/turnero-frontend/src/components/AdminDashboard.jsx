import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatisticsCard from '../components/admin/StatisticsCard';
import ReservationsTable from '../components/admin/ReservationsTable';
import UsersList from '../components/admin/UsersList';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaFutbol, FaUser, FaBan } from 'react-icons/fa';

const AdminDashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/admin/estadisticas', {
          headers: { 'x-auth-token': token },
        });
        setEstadisticas(res.data);
      } catch (err) {
        console.error('Error al obtener las estadísticas:', err);
        toast.error('Error al obtener las estadísticas.');
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Panel de Administración</h1>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
        </div>
      ) : estadisticas ? (
        <>
          <div className="row">
            <div className="col-md-3">
              <StatisticsCard 
                title="Reservas activas" 
                value={estadisticas.totalReservas || 0} 
                icon={<FaCalendarAlt />} 
                bgColor="bg-primary" 
              />
            </div>
            <div className="col-md-3">
              <StatisticsCard 
                title="Reservas Canceladas" 
                value={estadisticas.totalCanceladas || 0} 
                icon={<FaBan />} 
                bgColor="bg-danger" 
              />
            </div>
            <div className="col-md-3">
              <StatisticsCard 
                title="Cancha más Reservada" 
                value={estadisticas.canchaMasReservada || "N/A"} 
                icon={<FaFutbol />} 
                bgColor="bg-success" 
              />
            </div>
            <div className="col-md-3">
              <StatisticsCard 
                title="Usuario más Activo" 
                value={estadisticas.usuarioMasActivo || "N/A"} 
                icon={<FaUser />} 
                bgColor="bg-warning" 
              />
            </div>
          </div>
          <ReservationsTable />
          <UsersList />
        </>
      ) : (
        <p className="text-center text-danger">No se pudieron cargar las estadísticas.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
