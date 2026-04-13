import './App.css';
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import OrdersList from "./pages/OrdersList";
import CreateOrder from "./pages/CreateOrder";
import OrderDetail from "./pages/OrderDetail";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Clients from "./pages/Clients";
import Bikes from "./pages/Bikes";

function AppHeader() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!isAuthenticated) return null;

  return (
    <header className="app-header">
      <div>
        <h1>Taller Motos</h1>
        <p className="app-subtitle">Gestión de órdenes y motos</p>
      </div>
      <nav className="nav-links">
        <Link className="nav-button" to="/">
          Órdenes
        </Link>
        {isAdmin && (
          <Link className="nav-button" to="/create">
            Crear orden
          </Link>
        )}
        {isAdmin && (
          <Link className="nav-button nav-secondary" to="/users">
            Usuarios
          </Link>
        )}
        {isAdmin && (
          <Link className="nav-button nav-secondary" to="/clients">
            Clientes
          </Link>
        )}
        {isAdmin && (
          <Link className="nav-button nav-secondary" to="/bikes">
            Motos
          </Link>
        )}
        <div className="user-info-header">
          <span className="user-name-badge">
            {user?.name}
            <span className={`role-badge-small role-${user?.role?.toLowerCase()}`}>
              {user?.role}
            </span>
          </span>
          <button className="logout-button" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </nav>
    </header>
  );
}

function AppContent() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="page-shell">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <OrdersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <CreateOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bikes"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Bikes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;