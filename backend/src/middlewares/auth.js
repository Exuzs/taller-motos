const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Middleware de autenticación.
 * Verifica el JWT en el header Authorization y carga el usuario en req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user || !user.active) {
      return res.status(401).json({ error: "No autorizado" });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "No autorizado" });
  }
};

/**
 * Middleware de autorización por roles.
 * Uso: authorize("ADMIN") o authorize("ADMIN", "MECANICO")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autorizado" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No tiene permisos para esta acción" });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
