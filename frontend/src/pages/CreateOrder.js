import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import api from "../services/api";

// Estilos personalizados para react-select con fondo claro y texto oscuro
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
  loadingMessage: (base) => ({ ...base, color: "#6b7280" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#6b7280" }),
  clearIndicator: (base) => ({ ...base, color: "#6b7280" }),
};

function CreateOrder() {
  const [faultDescription, setFaultDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const [clients, setClients] = useState([]);
  const [selectedClientOption, setSelectedClientOption] = useState(null);

  const [clientBikes, setClientBikes] = useState([]);
  const [selectedBikeOption, setSelectedBikeOption] = useState(null);
  const [loadingBikes, setLoadingBikes] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get("/clients");
        const list = Array.isArray(res.data) ? res.data : res.data.data;
        setClients(list.map(c => ({
          value: c.id,
          label: c.name,
          sub: [c.phone, c.email].filter(Boolean).join(" · "),
          raw: c
        })));
      } catch {
        setError("Error al cargar clientes");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleClientChange = async (option) => {
    setSelectedClientOption(option);
    setSelectedBikeOption(null);
    setClientBikes([]);
    if (!option) return;
    setLoadingBikes(true);
    try {
      const res = await api.get("/bikes");
      const all = Array.isArray(res.data) ? res.data : res.data.data;
      const filtered = all.filter(b => b.clientId === option.value);
      setClientBikes(filtered.map(b => ({
        value: b.id,
        label: `${b.placa}${b.brand ? ` · ${b.brand}` : ""}${b.model ? ` ${b.model}` : ""}${b.cylinder ? ` (${b.cylinder}cc)` : ""}`
      })));
    } catch {
      setError("Error al cargar motos del cliente");
    } finally {
      setLoadingBikes(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClientOption) { setError("Selecciona un cliente."); return; }
    if (!selectedBikeOption) { setError("Selecciona una moto."); return; }
    setSaving(true);
    setSuccessMessage("");
    setError("");
    try {
      await api.post("/work-orders", {
        motoId: Number(selectedBikeOption.value),
        faultDescription
      });
      setSuccessMessage("Orden creada con éxito.");
      setSelectedClientOption(null);
      setSelectedBikeOption(null);
      setClientBikes([]);
      setFaultDescription("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear la orden.");
    } finally {
      setSaving(false);
    }
  };

  // Renderizado personalizado de cada opción de cliente (nombre + subtexto)
  const formatClientOption = (option) => (
    <div>
      <div style={{ fontWeight: 600 }}>{option.label}</div>
      {option.sub && (
        <div style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: 2 }}>{option.sub}</div>
      )}
    </div>
  );

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>Crear Orden</h2>
          <p>Registra una nueva orden de trabajo para una moto existente.</p>
        </div>
        <Link className="secondary-button" to="/">
          Volver a órdenes
        </Link>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>

        {/* ── Cliente ── */}
        <div className="form-field">
          <label>Cliente</label>
          <Select
            options={clients}
            value={selectedClientOption}
            onChange={handleClientChange}
            styles={selectStyles}
            placeholder="Escribe el nombre del cliente..."
            noOptionsMessage={() => "No se encontraron clientes"}
            isLoading={loading}
            loadingMessage={() => "Cargando clientes..."}
            isClearable
            formatOptionLabel={formatClientOption}
            filterOption={(option, inputValue) =>
              option.data.label.toLowerCase().includes(inputValue.toLowerCase()) ||
              (option.data.sub && option.data.sub.includes(inputValue))
            }
          />
        </div>

        {/* ── Moto ── */}
        {selectedClientOption && (
          <div className="form-field">
            <label>Moto</label>
            {clientBikes.length === 0 && !loadingBikes ? (
              <p style={{ color: "#ef4444", margin: 0, fontSize: "0.85rem" }}>
                Este cliente no tiene motos registradas.
              </p>
            ) : (
              <Select
                options={clientBikes}
                value={selectedBikeOption}
                onChange={setSelectedBikeOption}
                styles={selectStyles}
                placeholder="Selecciona la moto..."
                noOptionsMessage={() => "Sin motos"}
                isLoading={loadingBikes}
                loadingMessage={() => "Cargando motos..."}
                isClearable
              />
            )}
          </div>
        )}

        {/* ── Descripción de la falla ── */}
        <div className="form-field">
          <label>Descripción de la falla</label>
          <textarea
            placeholder="Describa el problema"
            rows={4}
            value={faultDescription}
            onChange={(e) => setFaultDescription(e.target.value)}
            required
          />
        </div>

        <button
          className="primary-button"
          type="submit"
          disabled={saving || !selectedClientOption || !selectedBikeOption}
        >
          {saving ? "Creando orden..." : "Crear orden"}
        </button>

        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {error && <div className="alert alert-error">{error}</div>}
      </form>
    </div>
  );
}

export default CreateOrder;
