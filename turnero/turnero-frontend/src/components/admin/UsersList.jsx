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
                console.error('Error al obtener los usuarios:', err);
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
            console.error('Error al bloquear/desbloquear usuario:', err);
            toast.error('Error al bloquear/desbloquear usuario.');
        }
    };

    const usuariosPaginados = usuarios.slice(
        (currentPage - 1) * usuariosPorPagina,
        currentPage * usuariosPorPagina
    );

    return (
        <div className="mt-4">
            <h2 className="mb-3">Gestión de Usuarios</h2>
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
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosPaginados.map((usuario) => (
                            <tr key={usuario._id}>
                                <td>{usuario.username}</td>
                                <td>{usuario.email || 'Sin Email'}</td>
                                <td>{usuario.role}</td>
                                <td>{usuario.bloqueado ? 'Bloqueado' : 'Activo'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UsersList;
