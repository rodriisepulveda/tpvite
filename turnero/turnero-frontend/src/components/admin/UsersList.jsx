import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
                setUsuarios(res.data);
            } catch (err) {
                console.error('❌ Error al obtener los usuarios:', err);
                toast.error('Error al obtener los usuarios.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

    const handleBlockUser = async (userId, bloqueado) => {
        try {
            await axios.put(
                `http://localhost:5000/api/admin/usuarios/${userId}/bloquear`,
                { bloqueado: !bloqueado },
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );

            toast.success(`Usuario ${!bloqueado ? 'bloqueado' : 'desbloqueado'} correctamente.`);
            setUsuarios((prevUsuarios) =>
                prevUsuarios.map((usuario) =>
                    usuario._id === userId ? { ...usuario, bloqueado: !bloqueado } : usuario
                )
            );
        } catch (err) {
            console.error('❌ Error al bloquear/desbloquear usuario:', err);
            toast.error('Error al bloquear/desbloquear usuario.');
        }
    };

    // 🔎 Filtrar usuarios según el término de búsqueda (por nombre o email)
    const usuariosFiltrados = usuarios.filter(
        (usuario) =>
            usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 📌 Paginación: mostrar solo los usuarios correspondientes a la página actual
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
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}> {/* 📌 SCROLL INTERNO */}
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
                                        <td>{usuario.username}</td>
                                        <td>{usuario.email || 'Sin Email'}</td>
                                        <td>{usuario.role}</td>
                                        <td>
                                            <span className={`badge ${usuario.bloqueado ? 'bg-danger' : 'bg-success'}`}>
                                                {usuario.bloqueado ? 'Bloqueado' : 'Activo'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`btn btn-${usuario.bloqueado ? 'success' : 'danger'} btn-sm`}
                                                onClick={() => handleBlockUser(usuario._id, usuario.bloqueado)}
                                            >
                                                {usuario.bloqueado ? 'Desbloquear' : 'Bloquear'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">No hay usuarios registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 📌 Paginación */}
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
                    disabled={currentPage * usuariosPorPagina >= usuariosFiltrados.length}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Siguiente ➡
                </button>
            </div>
        </div>
    );
};

export default UsersList;
