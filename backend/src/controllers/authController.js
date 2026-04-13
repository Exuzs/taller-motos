const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * POST /api/auth/login
 * Autentica usuario y retorna JWT.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !user.active) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isValid = await user.validatePassword(password);

    if (!isValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({
      token,
      user: user.toSafeJSON()
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

/**
 * POST /api/auth/register
 * Solo ADMIN puede registrar nuevos usuarios.
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
    }

    if (role && !["ADMIN", "MECANICO"].includes(role)) {
      return res.status(400).json({ error: "Rol inválido. Use ADMIN o MECANICO" });
    }

    // Verificar email único
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const user = await User.create({
      name,
      email,
      password_hash: password, // El hook beforeCreate lo hashea
      role: role || "MECANICO"
    });

    res.status(201).json(user.toSafeJSON());
  } catch (error) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

/**
 * GET /api/auth/me
 * Retorna el perfil del usuario autenticado.
 */
exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user.toSafeJSON());
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};
