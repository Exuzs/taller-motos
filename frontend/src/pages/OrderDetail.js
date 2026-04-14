import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const statusTransitions = {
  RECIBIDA: ["DIAGNOSTICO", "CANCELADA"],
  DIAGNOSTICO: ["EN_PROCESO", "CANCELADA"],
  EN_PROCESO: ["LISTA", "CANCELADA"],
  LISTA: ["ENTREGADA", "CANCELADA"],
  ENTREGADA: [],
  CANCELADA: []
};

// Estados permitidos para MECANICO
const MECANICO_ALLOWED = ["DIAGNOSTICO", "EN_PROCESO", "LISTA"];

function OrderDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Historial
  const [history, setHistory] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("detalle");

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  // Items
  const [newItem, setNewItem] = useState({ type: "REPUESTO", description: "", count: 1, unitValue: 0 });
  const [itemSaving, setItemSaving] = useState(false);

  const getOrder = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/work-orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar la orden");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const getHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/work-orders/${id}/history?page=${historyPage}&pageSize=100`);
      setHistory(res.data.data);
      setHistoryTotal(res.data.total);
    } catch (err) {
      console.error("Error al cargar historial:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [id, historyPage]);

  useEffect(() => {
    getOrder();
  }, [getOrder]);

  useEffect(() => {
    if (activeTab === "historial") {
      getHistory();
    }
  }, [activeTab, getHistory]);

  const nextStatuses = useMemo(() => {
    if (!order) return [];
    const all = statusTransitions[order.status] || [];
    // Si es mecánico, filtrar solo los estados permitidos
    if (!isAdmin) {
      return all.filter(s => MECANICO_ALLOWED.includes(s));
    }
    return all;
  }, [order, isAdmin]);

  const openStatusModal = (status) => {
    setPendingStatus(status);
    setStatusNote("");
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    setSaving(true);
    setError("");

    try {
      await api.patch(`/work-orders/${id}/status`, {
        toStatus: pendingStatus,
        note: statusNote || undefined
      });
      setShowStatusModal(false);
      setPendingStatus("");
      setStatusNote("");
      await getOrder();
      // Si estamos en historial, refrescar
      if (activeTab === "historial") {
        await getHistory();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar estado");
    } finally {
      setSaving(false);
    }
  };

  const cancelStatusChange = () => {
    setShowStatusModal(false);
    setPendingStatus("");
    setStatusNote("");
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setItemSaving(true);
    setError("");

    try {
      await api.post(`/work-orders/${id}/items`, {
        ...newItem,
        count: Number(newItem.count),
        unitValue: Number(newItem.unitValue)
      });
      setNewItem({ type: "REPUESTO", description: "", count: 1, unitValue: 0 });
      await getOrder(); // Recargar para obtener el nuevo total y la lista de ítems
    } catch (err) {
      setError(err.response?.data?.error || "Error al agregar ítem");
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cobro/ítem?")) return;
    try {
      await api.delete(`/work-orders/items/${itemId}`);
      await getOrder();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar ítem");
    }
  };

  if (loading) return <p>Cargando orden...</p>;
  if (error && !order) return <p className="alert alert-error">{error}</p>;
  if (!order) return <p>No se encontró la orden.</p>;

  const bike = order.Bike;
  const client = bike?.Client;

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>Orden #{order.id}</h2>
          <p>Detalle de la orden y control del flujo de trabajo.</p>
        </div>
        <Link className="secondary-button" to="/">
          Volver a órdenes
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "detalle" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("detalle")}
        >
          📋 Detalle
        </button>
        <button
          className={`tab ${activeTab === "historial" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("historial")}
        >
          📜 Historial
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {activeTab === "detalle" && (
        <>
          <div className="detail-grid">
            <div className="detail-card">
              <h3>Datos de la moto</h3>
              <div className="detail-row">
                <span>Cliente</span>
                <strong>{client?.name || "No asignado"}</strong>
              </div>
              <div className="detail-row">
                <span>Placa</span>
                <strong>{bike?.placa || "No disponible"}</strong>
              </div>
              <div className="detail-row">
                <span>Marca</span>
                <strong>{bike?.brand || "-"}</strong>
              </div>
              <div className="detail-row">
                <span>Modelo</span>
                <strong>{bike?.model || "-"}</strong>
              </div>
            </div>

            <div className="detail-card">
              <h3>Estado de la orden</h3>
              <div className="detail-row">
                <span>Fecha</span>
                <strong>{new Date(order.entryDate).toLocaleString()}</strong>
              </div>
              <div className="detail-row">
                <span>Estado</span>
                <strong>
                  <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                    {order.status.replace("_", " ")}
                  </span>
                </strong>
              </div>
              <div className="detail-row">
                <span>Total</span>
                <strong>${Number(order.total ?? 0).toFixed(2)}</strong>
              </div>
              <div className="detail-row">
                <span>Descripción</span>
                <strong>{order.faultDescription}</strong>
              </div>
            </div>
          </div>

          <div className="actions">
            {nextStatuses.length === 0 ? (
              <p className="no-transitions">No hay transiciones disponibles.</p>
            ) : (
              nextStatuses.map((status) => (
                <button
                  key={status}
                  className={`primary-button ${status === "CANCELADA" ? "danger-button" : ""}`}
                  onClick={() => openStatusModal(status)}
                  disabled={saving}
                >
                  {status.replace("_", " ")}
                </button>
              ))
            )}
          </div>

          <div className="section-divider" style={{ marginTop: 40, marginBottom: 20 }}>
            <hr />
            <h3 style={{ margin: "20px 0 10px 0" }}>Ítems, Repuestos y Cobros</h3>
          </div>

          <div className="items-section">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Valor Unitario</th>
                    <th>Subtotal</th>
                    {isAdmin && <th>Acción</th>}
                  </tr>
                </thead>
                <tbody>
                  {order.Items && order.Items.length > 0 ? (
                    order.Items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <span className={`status-badge status-${item.type === 'REPUESTO' ? 'lista' : 'en_proceso'}`}>
                            {item.type.replace("_", " ")}
                          </span>
                        </td>
                        <td>{item.description}</td>
                        <td>{item.count}</td>
                        <td>${Number(item.unitValue).toFixed(2)}</td>
                        <td><strong>${(item.count * item.unitValue).toFixed(2)}</strong></td>
                        {isAdmin && (
                          <td>
                            <button
                              className="action-btn action-danger"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              🗑️ Borrar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? "6" : "5"} style={{ textAlign: "center" }}>
                        No hay ítems registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="add-item-card" style={{ marginTop: 20, padding: 20, background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
              <h4 style={{ marginTop: 0 }}>Añadir nuevo ítem</h4>
              <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '15px' }}>
                <div className="form-field" style={{ flex: '0 0 auto', minWidth: '140px' }}>
                  <label>Tipo</label>
                  <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})} style={{ width: '100%' }}>
                    <option value="REPUESTO">REPUESTO</option>
                    <option value="MANO_OBRA">MANO DE OBRA</option>
                  </select>
                </div>
                <div className="form-field" style={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <label>Descripción</label>
                  <input
                    placeholder="Ej. Cambio de Aceite"
                    value={newItem.description}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-field" style={{ flex: '0 0 auto', minWidth: '80px' }}>
                  <label>Cant.</label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.count}
                    onChange={e => setNewItem({...newItem, count: e.target.value})}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-field" style={{ flex: '0 0 auto', minWidth: '120px' }}>
                  <label>Costo Un. ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.unitValue}
                    onChange={e => setNewItem({...newItem, unitValue: e.target.value})}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <button type="submit" className="primary-button" disabled={itemSaving} style={{ flex: '0 0 auto', padding: '10px 20px', height: '42px' }}>
                  {itemSaving ? "Añadiendo..." : "Añadir"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {activeTab === "historial" && (
        <div className="history-section">
          {historyLoading ? (
            <p>Cargando historial...</p>
          ) : history.length === 0 ? (
            <p className="empty-history">No hay registros de historial.</p>
          ) : (
            <div className="timeline">
              {history.map((entry, index) => (
                <div key={entry.id} className="timeline-item">
                  <div className="timeline-marker">
                    <div className={`timeline-dot ${index === 0 ? "timeline-dot-active" : ""}`}></div>
                    {index < history.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-date">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                      <span className="timeline-user">
                        {entry.User?.name || "Sistema"}
                        <span className={`role-badge-small role-${entry.User?.role?.toLowerCase()}`}>
                          {entry.User?.role}
                        </span>
                      </span>
                    </div>
                    <div className="timeline-transition">
                      {entry.from_status ? (
                        <>
                          <span className={`status-badge status-mini status-${entry.from_status?.toLowerCase()}`}>
                            {entry.from_status?.replace("_", " ")}
                          </span>
                          <span className="transition-arrow">→</span>
                          <span className={`status-badge status-mini status-${entry.to_status?.toLowerCase()}`}>
                            {entry.to_status?.replace("_", " ")}
                          </span>
                        </>
                      ) : (
                        <span className={`status-badge status-mini status-${entry.to_status?.toLowerCase()}`}>
                          {entry.to_status?.replace("_", " ")} (inicial)
                        </span>
                      )}
                    </div>
                    {entry.note && (
                      <div className="timeline-note">
                        💬 {entry.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {historyTotal > 100 && (
                <div className="pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 15, marginTop: 30 }}>
                  <button
                    className="secondary-button"
                    disabled={historyPage === 1}
                    onClick={() => setHistoryPage(historyPage - 1)}
                  >
                    Anterior
                  </button>
                  <span>Página {historyPage} de {Math.ceil(historyTotal / 100)}</span>
                  <button
                    className="secondary-button"
                    disabled={historyPage === Math.ceil(historyTotal / 100)}
                    onClick={() => setHistoryPage(historyPage + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de cambio de estado */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={cancelStatusChange}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cambiar Estado</h3>
            <p>
              Cambiar de <strong>{order.status.replace("_", " ")}</strong> a{" "}
              <strong>{pendingStatus.replace("_", " ")}</strong>
            </p>

            <div className="form-field">
              <label>Nota / Motivo (opcional)</label>
              <textarea
                placeholder="Agregar una nota sobre este cambio..."
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={cancelStatusChange}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className={`primary-button ${pendingStatus === "CANCELADA" ? "danger-button" : ""}`}
                onClick={confirmStatusChange}
                disabled={saving}
              >
                {saving ? "Actualizando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
