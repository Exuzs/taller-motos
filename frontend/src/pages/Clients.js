import { useEffect, useState } from "react";
import api from "../services/api";

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const pageSize = 10;

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/clients?page=${page}&pageSize=${pageSize}`);
      setClients(res.data.data);
      setTotalClients(res.data.total);
    } catch (err) {
      setError("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [page]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, formData);
        setSuccess("Cliente actualizado exitosamente");
      } else {
        await api.post("/clients", formData);
        setSuccess("Cliente creado exitosamente");
      }
      setFormData({ name: "", phone: "", email: "" });
      setEditingId(null);
      setShowForm(false);
      loadClients();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar el cliente");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (client) => {
    setFormData({ name: client.name, phone: client.phone || "", email: client.email || "" });
    setEditingId(client.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "" });
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
        <button className="primary-button" onClick={() => showForm ? handleCancelForm() : setShowForm(true)}>
          {showForm ? "Cancelar" : "Registrar Cliente"}
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {showForm && (
        <form className="user-create-form" onSubmit={handleSave}>
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
                placeholder="+57 o solo números"
                pattern="^\+?[0-9\s]{10,}$"
                title="Debe tener al menos 10 números"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label>Correo Electrónico (Opcional)</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Guardando..." : (editingId ? "Actualizar Cliente" : "Guardar Cliente")}
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
                    <div className="user-actions">
                      <button
                        className="action-btn action-primary"
                        onClick={() => handleEditClick(c)}
                        title="Editar Cliente"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="action-btn action-danger"
                        onClick={() => deleteClient(c.id)}
                        title="Eliminar Cliente"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalClients > pageSize && (
            <div className="pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 15, marginTop: 20 }}>
              <button
                className="secondary-button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>
              <span>Página {page} de {Math.ceil(totalClients / pageSize)}</span>
              <button
                className="secondary-button"
                disabled={page === Math.ceil(totalClients / pageSize)}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Clients;
