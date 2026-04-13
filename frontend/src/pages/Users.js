import { useEffect, useState } from "react";
import api from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "MECANICO" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", formData);
      setSuccess("Usuario creado exitosamente");
      setFormData({ name: "", email: "", password: "", role: "MECANICO" });
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear usuario");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.patch(`/users/${user.id}`, { active: !user.active });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar usuario");
    }
  };

  const changeRole = async (user, newRole) => {
    try {
      await api.patch(`/users/${user.id}`, { role: newRole });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar rol");
    }
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p>Administra las cuentas y permisos del equipo.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancelar" : "Nuevo Usuario"}
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {showForm && (
        <form className="user-create-form" onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-field">
              <label>Nombre</label>
              <input
                placeholder="Nombre completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label>Rol</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="MECANICO">MECÁNICO</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Creando..." : "Crear Usuario"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <div className="table-wrapper">
          <table>
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.active ? "status-lista" : "status-cancelada"}`}>
                      {user.active ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      <button
                        className="action-btn"
                        onClick={() => changeRole(user, user.role === "ADMIN" ? "MECANICO" : "ADMIN")}
                        title="Cambiar rol"
                      >
                        🔄 {user.role === "ADMIN" ? "→ Mecánico" : "→ Admin"}
                      </button>
                      <button
                        className={`action-btn ${user.active ? "action-danger" : "action-success"}`}
                        onClick={() => toggleActive(user)}
                        title={user.active ? "Desactivar" : "Activar"}
                      >
                        {user.active ? "🚫 Desactivar" : "✅ Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Users;
