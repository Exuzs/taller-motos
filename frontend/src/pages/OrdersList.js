import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const statusClass = (status) => {
  return `status-badge status-${status?.toLowerCase()}`;
};

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPlate, setSearchPlate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async (filters = {}) => {
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.plate) params.append("plate", filters.plate);
    if (filters.status) params.append("status", filters.status);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`/work-orders${query}`);
    setOrders(res.data.data);
    setLoading(false);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await getOrders({ plate: searchPlate.trim(), status: statusFilter });
  };

  const clearFilters = async () => {
    setSearchPlate("");
    setStatusFilter("");
    await getOrders();
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
          <input
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value)}
            placeholder="Ej. ABC123"
          />
        </div>

        <div className="filter-field">
          <label>Filtrar por estado</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="RECIBIDA">RECIBIDA</option>
            <option value="DIAGNOSTICO">DIAGNÓSTICO</option>
            <option value="EN_PROCESO">EN PROCESO</option>
            <option value="LISTA">LISTA</option>
            <option value="ENTREGADA">ENTREGADA</option>
            <option value="CANCELADA">CANCELADA</option>
          </select>
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
        </div>
      )}
    </div>
  );
}

export default OrdersList;
