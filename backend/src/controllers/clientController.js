const { Client } = require("../models");
const { Op } = require("sequelize");

exports.createClient = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const client = await Client.create({ name, phone, email });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClients = async (req, res) => {
  try {
    const { search } = req.query;

    let where = {};

    if (search) {
      where.name = {
        [Op.like]: `%${search}%`
      };
    }

    const clients = await Client.findAll({ where });

    res.json(clients);
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