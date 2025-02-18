import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (username.trim() === "") errors.username = "El nombre de usuario es obligatorio.";
    if (password.length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres.";
    if (!["admin", "user"].includes(role)) errors.role = "El rol debe ser 'admin' o 'user'.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", { username, password, role });
      toast.success("Registro exitoso");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="vh-100" style={{ backgroundColor: "#508bfc" }}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-2-strong" style={{ borderRadius: "1rem" }}>
              <div className="card-body p-5 text-center">
                <h3 className="mb-5">Registrarse</h3>
                <form onSubmit={handleSubmit}>

                  <div className="form-outline mb-4">
                    <input
                      type="text"
                      id="username"
                      className="form-control form-control-lg"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <label className="form-label" htmlFor="username">Usuario</label>
                    {errors.username && <small className="text-danger">{errors.username}</small>}
                  </div>

                  <div className="form-outline mb-4">
                    <input
                      type="password"
                      id="password"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label className="form-label" htmlFor="password">Contraseña</label>
                    {errors.password && <small className="text-danger">{errors.password}</small>}
                  </div>

                  <div className="form-outline mb-4">
                    <select
                      id="role"
                      className="form-control form-control-lg"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un rol</option>
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <label className="form-label" htmlFor="role">Rol</label>
                    {errors.role && <small className="text-danger">{errors.role}</small>}
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg btn-block w-100" disabled={loading}>
                    {loading ? "Registrando..." : "Registrarse"}
                  </button>
                </form>

                <hr className="my-4" />

                {/* Botones para futuros logins con Google y Facebook */}
                <button className="btn btn-lg btn-block btn-danger w-100 mb-2" disabled>
                  <i className="fab fa-google me-2"></i> Registrarse con Google
                </button>
                <button className="btn btn-lg btn-block btn-primary w-100" disabled>
                  <i className="fab fa-facebook-f me-2"></i> Registrarse con Facebook
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
