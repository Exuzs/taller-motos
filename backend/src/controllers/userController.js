const { User } = require("../models");

/**
 * GET /api/users
 * Lista todos los usuarios (sin password_hash).
 */
exports.getUsers = async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    const query = {
      attributes: { exclude: ["password_hash"] },
      order: [["createdAt", "DESC"]]
    };

    if (page && pageSize) {
      const limit = parseInt(pageSize, 10);
      const offset = (parseInt(page, 10) - 1) * limit;
      query.limit = limit;
      query.offset = offset;
      
      const users = await User.findAndCountAll(query);
      return res.json({ total: users.count, data: users.rows });
    } else {
      const users = await User.findAll(query);
      return res.json(users);
    }
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
    const { role, active, name, email, password } = req.body;

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
      user.role = role;
    }

    if (active !== undefined) {
      user.active = active;
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined) {
      user.email = email;
    }

    if (password !== undefined && password.trim() !== "") {
      user.password_hash = password;
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
