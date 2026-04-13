import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateOrder() {
  const [motoId, setMotoId] = useState("");
  const [faultDescription, setFaultDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const res = await api.get("/bikes");
        setBikes(res.data);
      } catch (err) {
        setError("Error al cargar las motos");
      } finally {
        setLoading(false);
      }
    };
    fetchBikes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motoId) return;
    setSaving(true);
    setSuccessMessage("");
    setError("");

    try {
      await api.post("/work-orders", {
        motoId: Number(motoId),
        faultDescription
      });

      setSuccessMessage("Orden creada con éxito.");
      setMotoId("");
      setFaultDescription("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear la orden.");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="form-field">
          <label>Moto del Cliente</label>
          <select
            value={motoId}
            onChange={(e) => setMotoId(e.target.value)}
            required
            disabled={loading || bikes.length === 0}
          >
            <option value="">-- Seleccione una moto --</option>
            {bikes.map(bike => (
              <option key={bike.id} value={bike.id}>
                {bike.placa} ({bike.Client?.name || "Sin cliente vinculado"})
              </option>
            ))}
          </select>
          {bikes.length === 0 && !loading && (
            <p style={{ color: "#ef4444", margin: 0, fontSize: "0.85rem" }}>
              No hay motos registradas. Registre una moto primero.
            </p>
          )}
        </div>

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

        <button className="primary-button" type="submit" disabled={saving || !motoId}>
          {saving ? "Creando orden..." : "Crear orden"}
        </button>

        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {error && <div className="alert alert-error">{error}</div>}
      </form>
    </div>
  );
}

export default CreateOrder;
