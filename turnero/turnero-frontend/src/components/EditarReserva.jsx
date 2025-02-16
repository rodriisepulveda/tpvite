import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const EditarReserva = () => {
  const [reserva, setReserva] = useState(null);
  const [turnosLibres, setTurnosLibres] = useState([]);
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaNueva, setFechaNueva] = useState(new Date().toISOString().split("T")[0]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReserva = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/turnos/id/${id}`, {
          headers: { "x-auth-token": token },
        });
        setReserva(res.data);
        fetchTurnosLibres(res.data.date.split("T")[0], res.data.cancha._id);
      } catch (err) {
        console.error("Error al obtener la información de la reserva:", err);
        toast.error("Error al obtener la información de la reserva.");
      } finally {
        setLoading(false);
      }
    };

    fetchReserva();
  }, [id, navigate]);

  const fetchTurnosLibres = async (fecha, canchaId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/turnos/libres", {
        params: { date: fecha, cancha: canchaId },
        headers: { "x-auth-token": token },
      });
      setTurnosLibres(res.data);
    } catch (err) {
      console.error("Error al obtener los turnos libres:", err);
      toast.error("Error al obtener los turnos libres.");
    }
  };

  const handleUpdate = async () => {
    if (!selectedTurno) {
      toast.error("Por favor selecciona un turno para continuar.");
      return;
    }

    const token = localStorage.getItem("token");
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esto actualizará tu reserva con el nuevo horario.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(
        `http://localhost:5000/api/turnos/${id}`,
        {
          date: selectedTurno.date,
          startTime: selectedTurno.startTime,
          endTime: selectedTurno.endTime,
          cancha: selectedTurno.canchaId,
        },
        { headers: { "x-auth-token": token } }
      );

      toast.success("Reserva actualizada correctamente.");
      navigate("/misreservas");
    } catch (err) {
      console.error("Error al actualizar la reserva:", err);
      toast.error("Error al actualizar la reserva.");
    }
  };

  const minFecha = reserva ? new Date(reserva.date).toISOString().split("T")[0] : fechaNueva;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Editar Reserva</h1>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
        </div>
      ) : reserva ? (
        <div className="card p-4 shadow">
          <h5 className="card-title">Reserva Actual</h5>
          <p>Cancha: {reserva.cancha?.name || "Desconocida"}</p>
          <p>Fecha: {new Date(reserva.date).toLocaleDateString("es-ES")}</p>
          <p>Horario: {reserva.startTime} a {reserva.endTime}</p>

          <h5 className="mt-4">Selecciona un nuevo turno</h5>
          {turnosLibres.length > 0 ? (
            turnosLibres.map((turno) => (
              <div key={turno._id} className="form-check">
                <input
                  type="radio"
                  id={turno._id}
                  name="turno"
                  className="form-check-input"
                  onChange={() => setSelectedTurno(turno)}
                />
                <label htmlFor={turno._id} className="form-check-label">
                  {turno.startTime} a {turno.endTime}
                </label>
              </div>
            ))
          ) : (
            <p>No hay turnos disponibles para esta fecha.</p>
          )}

          <h5 className="mt-4">Reagendar otro día</h5>
          <input
            type="date"
            value={fechaNueva}
            min={minFecha} // Fecha mínima igual a la fecha de la reserva actual
            onChange={(e) => {
              setFechaNueva(e.target.value);
              fetchTurnosLibres(e.target.value, reserva.cancha._id);
            }}
            className="form-control"
          />

          <button className="btn btn-primary mt-4" onClick={handleUpdate} disabled={!selectedTurno}>
            Actualizar Reserva
          </button>
        </div>
      ) : (
        <p className="text-center">Cargando información de la reserva...</p>
      )}
    </div>
  );
};

export default EditarReserva;
