const { User } = require("../models");

/**
 * GET /api/users
 * Lista todos los usuarios (sin password_hash).
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash"] },
      order: [["createdAt", "DESC"]]
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PATCH /api/users/:id
 * Actualizar rol o activar/desactivar usuario.
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, active, name } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Evitar que un ADMIN se desactive a sí mismo
    if (Number(id) === req.user.id && active === false) {
      return res.status(400).json({ error: "No puede desactivarse a sí mismo" });
    }

    if (role !== undefined) {
      // Evitar que un ADMIN cambie su propio rol
      if (Number(id) === req.user.id && role !== user.role) {
        return res.status(400).json({ error: "No puede cambiar su propio rol" });
      }
      if (!["ADMIN", "MECANICO"].includes(role)) {
        return res.status(400).json({ error: "Rol inválido" });
      }
      user.role = role;
    }

    if (active !== undefined) {
      user.active = active;
    }

    if (name !== undefined) {
      user.name = name;
    }

    await user.save();

    res.json(user.toSafeJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Evitar que un admin se elimine a si mismo
    if (Number(id) === req.user.id) {
      return res.status(400).json({ error: "No puede eliminarse a sí mismo" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    await user.destroy();
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
