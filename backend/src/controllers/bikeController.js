const { Bike, Client } = require("../models");
const { Op } = require("sequelize");

// Crear moto
exports.createBike = async (req, res) => {
  try {
    const { placa, brand, model, cylinder, clientId } = req.body;

    // Validaciones
    if (!placa || !clientId) {
      return res.status(400).json({
        error: "La placa y el cliente son obligatorios"
      });
    }

    // Verificar cliente existe
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        error: "Cliente no existe"
      });
    }

    // Verificar placa única
    const existingBike = await Bike.findOne({ where: { placa } });
    if (existingBike) {
      return res.status(400).json({
        error: "La placa ya existe"
      });
    }

    const bike = await Bike.create({
      placa,
      brand,
      model,
      cylinder,
      clientId
    });

    res.status(201).json(bike);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener motos (buscar por placa)
exports.getBikes = async (req, res) => {
  try {
    const { plate } = req.query;

    let where = {};

    if (plate) {
      where.placa = {
        [Op.like]: `%${plate}%`
      };
    }

    const bikes = await Bike.findAll({
      where,
      include: Client
    });

    res.json(bikes);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener moto por ID
exports.getBikeById = async (req, res) => {
  try {
    const { id } = req.params;

    const bike = await Bike.findByPk(id, {
      include: Client
    });

    if (!bike) {
      return res.status(404).json({
        error: "Moto no encontrada"
      });
    }

    res.json(bike);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBike = async (req, res) => {
  try {
    const { id } = req.params;
    const { placa, brand, model, cylinder, clientId } = req.body;

    const bike = await Bike.findByPk(id);
    if (!bike) return res.status(404).json({ error: "Moto no encontrada" });

    if (placa) bike.placa = placa;
    if (brand !== undefined) bike.brand = brand;
    if (model !== undefined) bike.model = model;
    if (cylinder !== undefined) bike.cylinder = cylinder;
    if (clientId) bike.clientId = clientId;

    await bike.save();
    res.json(bike);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBike = async (req, res) => {
  try {
    const { id } = req.params;
    const bike = await Bike.findByPk(id);
    if (!bike) return res.status(404).json({ error: "Moto no encontrada" });

    await bike.destroy();
    res.json({ message: "Moto eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};