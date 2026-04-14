import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../services/api";

// Estilos para react-select con fondo claro y texto negro
const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: "#ffffff",
    borderColor: state.isFocused ? "#6366f1" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(99,102,241,0.25)" : "none",
    borderRadius: 8,
    minHeight: 42,
    "&:hover": { borderColor: "#6366f1" }
  }),
  menu: (base) => ({
    ...base,
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    zIndex: 200
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? "#f1f5f9" : "#ffffff",
    color: "#111827",
    cursor: "pointer",
    padding: "10px 14px"
  }),
  singleValue: (base) => ({ ...base, color: "#111827" }),
  input: (base) => ({ ...base, color: "#111827" }),
  placeholder: (base) => ({ ...base, color: "#6b7280" }),
  noOptionsMessage: (base) => ({ ...base, color: "#6b7280" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#6b7280" }),
  clearIndicator: (base) => ({ ...base, color: "#6b7280" }),
};

function Bikes() {
  const [bikes, setBikes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedClientOption, setSelectedClientOption] = useState(null);
  const [clientOptions, setClientOptions] = useState([]);
  
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
  const [page, setPage] = useState(1);
  const [totalBikes, setTotalBikes] = useState(0);
  const pageSize = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const [resBikes, resClients] = await Promise.all([
        api.get(`/bikes?page=${page}&pageSize=${pageSize}`),
        api.get("/clients") // No pasamos page aquí para traer TODO al listado del <select>
      ]);
      setBikes(resBikes.data.data);
      setTotalBikes(resBikes.data.total);
      const rawClients = Array.isArray(resClients.data) ? resClients.data : resClients.data.data;
      setClients(rawClients);
      setClientOptions(rawClients.map(c => ({
        value: c.id,
        label: c.name,
        sub: [c.phone, c.email].filter(Boolean).join(" · ")
      })));
    } catch (err) {
      setError("Error al cargar listados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!formData.clientId) {
      setError("Debes seleccionar un cliente válido");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        cylinder: formData.cylinder ? Number(formData.cylinder) : null
      };

      if (editingId) {
        await api.put(`/bikes/${editingId}`, payload);
        setSuccess("Moto actualizada exitosamente");
      } else {
        await api.post("/bikes", payload);
        setSuccess("Moto guardada exitosamente");
      }
      
      setFormData({ placa: "", brand: "", model: "", cylinder: "", clientId: "" });
      setEditingId(null);
      setSelectedClientOption(null);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar moto");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (bike) => {
    setFormData({
      placa: bike.placa,
      brand: bike.brand || "",
      model: bike.model || "",
      cylinder: bike.cylinder || "",
      clientId: bike.clientId
    });
    setEditingId(bike.id);
    const match = clientOptions.find(o => o.value === bike.clientId);
    setSelectedClientOption(match || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedClientOption(null);
    setFormData({ placa: "", brand: "", model: "", cylinder: "", clientId: "" });
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
        <button className="primary-button" onClick={() => showForm ? handleCancelForm() : setShowForm(true)}>
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
              <Select
                options={clientOptions}
                value={selectedClientOption}
                onChange={(opt) => {
                  setSelectedClientOption(opt);
                  setFormData(prev => ({ ...prev, clientId: opt ? opt.value : "" }));
                }}
                styles={selectStyles}
                placeholder="Escribe el nombre del cliente..."
                noOptionsMessage={() => "No se encontraron clientes"}
                isClearable
                formatOptionLabel={(opt) => (
                  <div>
                    <div style={{ fontWeight: 600 }}>{opt.label}</div>
                    {opt.sub && <div style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: 2 }}>{opt.sub}</div>}
                  </div>
                )}
              />
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
          <button className="primary-button" type="submit" disabled={saving || clients.length === 0}>
            {saving ? "Guardando..." : (editingId ? "Actualizar Vehículo" : "Guardar Vehículo")}
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
                    <div className="user-actions">
                      <button
                        className="action-btn action-primary"
                        onClick={() => handleEditClick(b)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="action-btn action-danger"
                        onClick={() => deleteBike(b.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalBikes > pageSize && (
            <div className="pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 15, marginTop: 20 }}>
              <button
                className="secondary-button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>
              <span>Página {page} de {Math.ceil(totalBikes / pageSize)}</span>
              <button
                className="secondary-button"
                disabled={page === Math.ceil(totalBikes / pageSize)}
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

export default Bikes;
