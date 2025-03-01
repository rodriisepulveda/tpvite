import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const UsersList = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usuariosPorPagina = 5;

    useEffect(() => {
        const fetchUsuarios = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                return;
            }

            try {
                const res = await axios.get('http://localhost:5000/api/admin/usuarios', {
                    headers: { 'x-auth-token': token },
                });

                const usuariosProcesados = res.data.map(user => ({
                    ...user,
                    _id: typeof user._id === 'object' && user._id.$oid ? user._id.$oid : user._id
                }));

                setUsuarios(usuariosProcesados);
            } catch (err) {
                console.error('❌ Error al obtener los usuarios:', err);
                toast.error('Error al obtener los usuarios.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

    // 🔹 Función para mostrar SweetAlert con mensajes bien conjugados
    const confirmarCambioEstado = async (estado, username) => {
        // Mapeo para que el mensaje sea correcto
        const acciones = {
            'Habilitado': 'habilitar',
            'Suspendido': 'suspender',
            'Deshabilitado': 'deshabilitar'
        };

        let icono = estado === 'Habilitado' ? 'success' : estado === 'Suspendido' ? 'warning' : 'error';
        let accion = acciones[estado];

        return Swal.fire({
            title: `¿Estás seguro de ${accion} a ${username}?`,
            icon: icono,
            showCancelButton: true,
            confirmButtonColor: estado === 'Habilitado' ? '#28a745' : estado === 'Suspendido' ? '#ffc107' : '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });
    };

    // 🔹 Función para actualizar el estado del usuario
    const handleChangeUserStatus = async (userId, estado, username) => {
        const result = await confirmarCambioEstado(estado, username);
        if (!result.isConfirmed) return;

        let suspensionHasta = null;

        if (estado === 'Suspendido') {
            const { value: tiempo } = await Swal.fire({
                title: 'Selecciona la duración de la suspensión',
                input: 'select',
                inputOptions: {
                    '3': '3 días',
                    '7': '1 semana',
                    '14': '2 semanas',
                    '30': '1 mes',
                },
                inputPlaceholder: 'Duración de la suspensión',
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
            });

            if (!tiempo) return;

            const fechaSuspension = new Date();
            fechaSuspension.setDate(fechaSuspension.getDate() + parseInt(tiempo));
            suspensionHasta = fechaSuspension.toISOString();
        }

        try {
            const token = localStorage.getItem('token');

            await axios.put(
                `http://localhost:5000/api/admin/usuarios/${userId}/estado`,
                { estado, suspensionHasta },
                { headers: { 'x-auth-token': token } }
            );

            toast.success(`Usuario ${username} ahora está ${estado}.`);

            setUsuarios((prevUsuarios) =>
                prevUsuarios.map((user) =>
                    user._id === userId ? { ...user, estado, suspensionHasta } : user
                )
            );
        } catch (err) {
            console.error('❌ Error al actualizar el estado del usuario:', err);
            toast.error('Error al actualizar el estado del usuario.');
        }
    };

    // 🔎 Filtrar usuarios según el término de búsqueda
    const usuariosFiltrados = usuarios.filter((usuario) => {
        const nombre = usuario.username?.toLowerCase() || '';
        const email = usuario.email?.toLowerCase() || '';
        return nombre.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    });

    // 📌 Paginación
    const usuariosPaginados = usuariosFiltrados.slice(
        (currentPage - 1) * usuariosPorPagina,
        currentPage * usuariosPorPagina
    );

    return (
        <div className="mt-4">
            <h2 className="mb-3">Gestión de Usuarios</h2>

            {/* 🔎 Barra de Búsqueda */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Buscar usuario por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Cargando...</span>
                    </div>
                </div>
            ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosPaginados.length > 0 ? (
                                usuariosPaginados.map((usuario) => (
                                    <tr key={usuario._id}>
                                        <td>{usuario.username || 'Desconocido'}</td>
                                        <td>{usuario.email || 'Sin Email'}</td>
                                        <td>{usuario.role}</td>
                                        <td>
                                            <span className={`badge bg-${usuario.estado === 'Habilitado' ? 'success' : usuario.estado === 'Deshabilitado' ? 'danger' : 'warning'}`}>
                                                {usuario.estado} {usuario.suspensionHasta ? ` (Hasta ${new Date(usuario.suspensionHasta).toLocaleDateString()})` : ''}
                                            </span>
                                        </td>
                                        <td>
                                            {usuario.estado !== 'Habilitado' && (
                                                <button className="btn btn-sm btn-success me-2" onClick={() => handleChangeUserStatus(usuario._id, 'Habilitado', usuario.username)}>
                                                    HABILITAR
                                                </button>
                                            )}
                                            {usuario.estado !== 'Suspendido' && (
                                                <button className="btn btn-sm btn-warning me-2" onClick={() => handleChangeUserStatus(usuario._id, 'Suspendido', usuario.username)}>
                                                    SUSPENDER
                                                </button>
                                            )}
                                            {usuario.estado !== 'Deshabilitado' && (
                                                <button className="btn btn-sm btn-danger" onClick={() => handleChangeUserStatus(usuario._id, 'Deshabilitado', usuario.username)}>
                                                    DESHABILITAR
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-danger">No hay usuarios registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UsersList;
