import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatisticsCard from '../components/admin/StatisticsCard';
import ReservationsTable from '../components/admin/ReservationsTable';
import UsersList from '../components/admin/UsersList';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaFutbol, FaUser, FaBan, FaCheckCircle } from 'react-icons/fa';
import '../components/styles/statisticsCard.css'; // Asegúrate de importar los estilos aquí

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

        // Verificar si totalConcluidas viene correctamente
        if (!res.data.totalConcluidas) {
          res.data.totalConcluidas = 0; // Evita mostrar "undefined"
        }

        setEstadisticas(res.data);
      } catch (err) {
        console.error('❌ Error al obtener las estadísticas:', err);
        toast.error('Error al obtener las estadísticas.');
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4 fw-bold">Panel de Administración</h1>

      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : estadisticas ? (
        <>
          {/* 📌 Sección de estadísticas con centrado dinámico */}
          <div className="statistics-container d-flex flex-wrap justify-content-center gap-3">
            <StatisticsCard 
              title="Reservas Activas" 
              value={estadisticas.totalReservas || 0} 
              icon={<FaCalendarAlt />} 
              bgColor="bg-primary" 
            />
            <StatisticsCard 
              title="Reservas Canceladas" 
              value={estadisticas.totalCanceladas || 0} 
              icon={<FaBan />} 
              bgColor="bg-danger" 
            />
            <StatisticsCard 
              title="Reservas Concluidas" 
              value={estadisticas.totalConcluidas || 0} 
              icon={<FaCheckCircle />} 
              bgColor="bg-secondary" 
            />
            <StatisticsCard 
              title="Cancha Más Reservada" 
              value={estadisticas.canchaMasReservada || "N/A"} 
              icon={<FaFutbol />} 
              bgColor="bg-success" 
            />
            <StatisticsCard 
              title="Usuario Más Activo" 
              value={estadisticas.usuarioMasActivo || "N/A"} 
              icon={<FaUser />} 
              bgColor="bg-warning" 
            />
          </div>

          {/* 📌 Sección de Reservas y Usuarios */}
          <ReservationsTable />
          <UsersList />
        </>
      ) : (
        <p className="text-center text-danger fw-bold">No se pudieron cargar las estadísticas.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
