import { useEffect, useState } from "react";
import api from "../services/api";

function Bikes() {
  const [bikes, setBikes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    placa: "",
    brand: "",
    model: "",
    cylinder: "",
    clientId: ""
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [resBikes, resClients] = await Promise.all([
        api.get("/bikes"),
        api.get("/clients")
      ]);
      setBikes(resBikes.data);
      setClients(resClients.data);
    } catch (err) {
      setError("Error al cargar listados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/bikes", {
        ...formData,
        cylinder: formData.cylinder ? Number(formData.cylinder) : null
      });
      setSuccess("Moto guardada exitosamente");
      setFormData({ placa: "", brand: "", model: "", cylinder: "", clientId: "" });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear moto");
    } finally {
      setSaving(false);
    }
  };

  const deleteBike = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar el registro de esta moto?")) return;
    try {
      await api.delete(`/bikes/${id}`);
      loadData();
      setSuccess("Moto eliminada");
    } catch (err) {
      setError("No se puede eliminar la moto, puede que tenga órdenes vinculadas.");
    }
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>Vehículos / Motos</h2>
          <p>Registra motocicletas y asígnalas a un cliente específico.</p>
        </div>
        <button className="primary-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Registrar Moto"}
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {showForm && (
        <form className="user-create-form" onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-field">
              <label>Dueño / Cliente</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                required
              >
                <option value="">-- Seleccione un cliente --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Placa (Matrícula)</label>
              <input
                placeholder="Ej. ABC123"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="form-field">
              <label>Marca</label>
              <input
                placeholder="Ej. Yamaha"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Modelo</label>
              <input
                placeholder="Ej. FZ 150"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Cilindraje</label>
              <input
                type="number"
                placeholder="Ej. 150"
                value={formData.cylinder}
                onChange={(e) => setFormData({ ...formData, cylinder: e.target.value })}
              />
            </div>
          </div>
          <button className="primary-button" type="submit" disabled={saving || clients.length===0}>
            {saving ? "Guardando..." : "Guardar Vehículo"}
          </button>
          
          {clients.length === 0 && (
            <p style={{ color: "#ef4444", marginTop: 10, fontSize: "0.9rem" }}>
              Debes registrar clientes primero para asignarles una moto.
            </p>
          )}
        </form>
      )}

      {loading ? (
        <p>Cargando motos...</p>
      ) : bikes.length === 0 ? (
        <p>No hay motos registradas.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Cliente</th>
                <th>Marca / Modelo</th>
                <th>Cilindraje</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bikes.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.placa}</strong></td>
                  <td>{b.Client?.name || "-"}</td>
                  <td>{b.brand} / {b.model}</td>
                  <td>{b.cylinder ? `${b.cylinder}cc` : "-"}</td>
                  <td>
                    <button
                      className="action-btn action-danger"
                      onClick={() => deleteBike(b.id)}
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

export default Bikes;
