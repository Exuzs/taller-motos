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

exports.getBikes = async (req, res) => {
  try {
    const { plate, page, pageSize } = req.query;

    let where = {};

    if (plate) {
      where.placa = {
        [Op.like]: `%${plate}%`
      };
    }

    const query = {
      where,
      include: Client,
      order: [["createdAt", "DESC"]]
    };

    if (page && pageSize) {
      const limit = parseInt(pageSize, 10);
      const offset = (parseInt(page, 10) - 1) * limit;
      query.limit = limit;
      query.offset = offset;

      const bikes = await Bike.findAndCountAll(query);
      return res.json({ total: bikes.count, data: bikes.rows });
    } else {
      const bikes = await Bike.findAll(query);
      return res.json(bikes);
    }

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