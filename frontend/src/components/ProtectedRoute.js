import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Componente que protege rutas.
 * - Si no está autenticado, redirige a /login.
 * - Si se especifican roles y el usuario no tiene el rol adecuado, muestra mensaje.
 */
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-card" style={{ textAlign: "center", padding: "60px" }}>
        <div className="loading-spinner"></div>
        <p>Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <div className="page-card">
        <div className="alert alert-error">
          <strong>Acceso denegado</strong>
          <p>No tiene permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
