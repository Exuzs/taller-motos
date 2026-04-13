import { useEffect, useState } from "react";
import api from "../services/api";

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await api.get("/clients");
      setClients(res.data);
    } catch (err) {
      setError("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/clients", formData);
      setSuccess("Cliente guardado exitosamente");
      setFormData({ name: "", phone: "", email: "" });
      setShowForm(false);
      loadClients();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear cliente");
    } finally {
      setSaving(false);
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      await api.delete(`/clients/${id}`);
      loadClients();
      setSuccess("Cliente eliminado");
    } catch (err) {
      setError("No se puede eliminar, puede que tenga órdenes vinculadas.");
    }
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>Clientes</h2>
          <p>Administra las personas que traen sus vehículos al taller.</p>
        </div>
        <button className="primary-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Registrar Cliente"}
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
              <label>Teléfono</label>
              <input
                placeholder="Ingrese número"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Correo Electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cliente"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Cargando clientes...</p>
      ) : clients.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.phone || "-"}</td>
                  <td>{c.email || "-"}</td>
                  <td>
                    <button
                      className="action-btn action-danger"
                      onClick={() => deleteClient(c.id)}
                      title="Eliminar Cliente"
                    >
                      🗑️ Eliminar
                    </button>
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

export default Clients;
