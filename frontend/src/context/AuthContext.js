import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  // Al montar, verificar token con /auth/me
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, logout]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);

    return userData;
  };

  const isAdmin = user?.role === "ADMIN";
  const isMecanico = user?.role === "MECANICO";
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isMecanico,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

export default AuthContext;
