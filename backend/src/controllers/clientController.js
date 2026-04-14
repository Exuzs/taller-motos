const { Client } = require("../models");
const { Op } = require("sequelize");

const isValidPhone = (phone) => {
  if (!phone) return false;
  // Permite opcionalmente un '+' al inicio, seguido de al menos 10 dígitos (ignorando espacios en la regex)
  const phoneRegex = /^\+?[0-9\s]{10,}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

const isValidEmail = (email) => {
  if (!email) return true; // es opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.createClient = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({ error: "El teléfono es obligatorio y debe tener al menos 10 números" });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "El formato del correo electrónico no es válido" });
    }

    const client = await Client.create({ name, phone, email });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClients = async (req, res) => {
  try {
    const { search, page, pageSize } = req.query;

    let where = {};

    if (search) {
      where.name = {
        [Op.like]: `%${search}%`
      };
    }

    const query = { where, order: [["createdAt", "DESC"]] };

    if (page && pageSize) {
      const limit = parseInt(pageSize, 10);
      const offset = (parseInt(page, 10) - 1) * limit;
      query.limit = limit;
      query.offset = offset;

      const clients = await Client.findAndCountAll(query);
      return res.json({ total: clients.count, data: clients.rows });
    } else {
      const clients = await Client.findAll(query);
      return res.json(clients);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    const client = await Client.findByPk(id);
    if (!client) return res.status(404).json({ error: "Cliente no encontrado" });

    if (name) client.name = name;
    if (phone !== undefined) client.phone = phone;
    if (email !== undefined) client.email = email;

    await client.save();
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) return res.status(404).json({ error: "Cliente no encontrado" });

    await client.destroy();
    res.json({ message: "Cliente eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};