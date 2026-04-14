import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import Select from "react-select";

const statusClass = (status) => {
  return `status-badge status-${status?.toLowerCase()}`;
};

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

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "RECIBIDA", label: "RECIBIDA" },
  { value: "DIAGNOSTICO", label: "DIAGNÓSTICO" },
  { value: "EN_PROCESO", label: "EN PROCESO" },
  { value: "LISTA", label: "LISTA" },
  { value: "ENTREGADA", label: "ENTREGADA" },
  { value: "CANCELADA", label: "CANCELADA" },
];

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlateOption, setSelectedPlateOption] = useState(null);
  const [selectedStatusOption, setSelectedStatusOption] = useState(statusOptions[0]);
  const [plateOptions, setPlateOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchPlates = async () => {
      try {
        const res = await api.get("/bikes");
        const bikes = Array.isArray(res.data) ? res.data : res.data.data;
        const options = bikes.map(b => ({
          value: b.placa,
          label: b.placa
        }));
        setPlateOptions(options);
      } catch (error) {
        console.error("Error fetching plates:", error);
      }
    };
    fetchPlates();
  }, []);

  useEffect(() => {
    getOrders({ plate: selectedPlateOption ? selectedPlateOption.value : "", status: selectedStatusOption.value });
  }, [page]);

  const getOrders = async (filters = {}) => {
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.plate) params.append("plate", filters.plate);
    if (filters.status) params.append("status", filters.status);
    params.append("page", page);
    params.append("pageSize", pageSize);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`/work-orders${query}`);
    setOrders(res.data.data);
    setTotalOrders(res.data.total);
    setLoading(false);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setPage(1); // Reiniciar a la primera página tras buscar
    await getOrders({ plate: selectedPlateOption ? selectedPlateOption.value : "", status: selectedStatusOption.value });
  };

  const clearFilters = async () => {
    setSelectedPlateOption(null);
    setSelectedStatusOption(statusOptions[0]);
    setPage(1);
    await getOrders({ plate: "", status: "" });
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>Órdenes</h2>
          <p>Revisa el estado de tus órdenes de trabajo y consulta los detalles de cada moto.</p>
        </div>
        <Link className="primary-button" to="/create">
          Crear orden
        </Link>
      </div>

      <form className="filter-form" onSubmit={handleSearch}>
        <div className="filter-field">
          <label>Buscar por placa</label>
          <Select
            options={plateOptions}
            value={selectedPlateOption}
            onChange={setSelectedPlateOption}
            styles={selectStyles}
            placeholder="Selecciona placa"
            isClearable
          />
        </div>

        <div className="filter-field">
          <label>Filtrar por estado</label>
          <Select
            options={statusOptions}
            value={selectedStatusOption}
            onChange={setSelectedStatusOption}
            styles={selectStyles}
            placeholder="Selecciona estado"
          />
        </div>

        <div className="filter-actions">
          <button className="secondary-button" type="submit">
            Buscar
          </button>
          <button className="secondary-button" type="button" onClick={clearFilters}>
            Limpiar
          </button>
        </div>
      </form>

      {loading ? (
        <p>Cargando órdenes...</p>
      ) : orders.length === 0 ? (
        <p>No hay órdenes registradas todavía.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.Bike?.placa || "-"}</td>
                  <td>{order.Bike?.Client?.name || "-"}</td>
                  <td>
                    <span className={statusClass(order.status)}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>${Number(order.total ?? 0).toFixed(2)}</td>
                  <td>
                    <Link className="secondary-button" to={`/orders/${order.id}`}>
                      Ver detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalOrders > pageSize && (
            <div className="pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 15, marginTop: 20 }}>
              <button
                className="secondary-button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>
              <span>Página {page} de {Math.ceil(totalOrders / pageSize)}</span>
              <button
                className="secondary-button"
                disabled={page === Math.ceil(totalOrders / pageSize)}
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

export default OrdersList;
