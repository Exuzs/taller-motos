const { WorkOrder, Bike, Client, Item, StatusHistory, User } = require("../models");
const { Op } = require("sequelize");

const calculateTotal = async (workOrderId) => {
  const items = await Item.findAll({
    where: { WorkOrderId: workOrderId }
  });

  let total = 0;

  items.forEach(item => {
    total += item.count * item.unitValue;
  });

  return total;
};

// Estados que MECANICO puede asignar
const MECANICO_ALLOWED_STATUSES = ["DIAGNOSTICO", "EN_PROCESO", "LISTA"];

exports.addItem = async (req, res) => {
  try {
    const { id } = req.params; // id de la orden
    const { type, description, count, unitValue } = req.body;

    // Validaciones
    if (!type || !count) {
      return res.status(400).json({
        error: "Tipo y cantidad son obligatorios"
      });
    }

    if (count <= 0) {
      return res.status(400).json({
        error: "La cantidad debe ser mayor a 0"
      });
    }

    if (unitValue < 0) {
      return res.status(400).json({
        error: "El valor no puede ser negativo"
      });
    }

    const order = await WorkOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        error: "Orden no encontrada"
      });
    }

    const item = await Item.create({
      type,
      description,
      count,
      unitValue,
      WorkOrderId: id
    });

    // 🔥 recalcular total
    const total = await calculateTotal(id);

    order.total = total;
    await order.save();

    res.status(201).json(item);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findByPk(itemId);

    if (!item) {
      return res.status(404).json({
        error: "Item no encontrado"
      });
    }

    const workOrderId = item.WorkOrderId;

    await item.destroy();

    // 🔥 recalcular total
    const total = await calculateTotal(workOrderId);

    const order = await WorkOrder.findByPk(workOrderId);
    order.total = total;
    await order.save();

    res.json({ message: "Item eliminado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createWorkOrder = async (req, res) => {
  try {
    const { motoId, faultDescription } = req.body;

    if (!motoId) {
      return res.status(400).json({
        error: "La moto es obligatoria"
      });
    }

    const bike = await Bike.findByPk(motoId);
    if (!bike) {
      return res.status(404).json({
        error: "Moto no encontrada"
      });
    }

    const order = await WorkOrder.create({
      BikeId: motoId,
      faultDescription,
      status: "RECIBIDA"
    });

    // Registrar en historial el estado inicial
    await StatusHistory.create({
      work_order_id: order.id,
      from_status: null,
      to_status: "RECIBIDA",
      note: "Orden creada",
      changed_by_user_id: req.user.id
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getWorkOrders = async (req, res) => {
  try {
    const { status, plate, page = 1, pageSize = 10 } = req.query;

    let where = {};
    let bikeWhere = {};

    if (status) {
      where.status = status;
    }

    if (plate) {
      bikeWhere.placa = {
        [Op.like]: `%${plate}%`
      };
    }

    const orders = await WorkOrder.findAndCountAll({
      where,
      include: {
        model: Bike,
        where: bikeWhere,
        include: Client
      },
      limit: parseInt(pageSize),
      offset: (page - 1) * pageSize,
      order: [["createdAt", "DESC"]]
    });

    res.json({
      total: orders.count,
      data: orders.rows
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await WorkOrder.findByPk(id, {
      include: [
        {
          model: Bike,
          include: Client
        },
        Item
      ]
    });

    if (!order) {
      return res.status(404).json({
        error: "Orden no encontrada"
      });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    // Soportar ambos: { toStatus, note } (nuevo) y { status } (legacy)
    const toStatus = req.body.toStatus || req.body.status;
    const { note } = req.body;

    if (!toStatus) {
      return res.status(400).json({ error: "El estado destino es obligatorio" });
    }

    const order = await WorkOrder.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const currentStatus = order.status;

    // Bloquear cambios idempotentes
    if (currentStatus === toStatus) {
      return res.status(400).json({
        error: `La orden ya se encuentra en estado ${currentStatus}`
      });
    }

    // Verificar permisos del mecánico
    if (req.user.role === "MECANICO" && !MECANICO_ALLOWED_STATUSES.includes(toStatus)) {
      return res.status(403).json({
        error: "No tiene permisos para cambiar a este estado"
      });
    }

    const transitions = {
      RECIBIDA: ["DIAGNOSTICO", "CANCELADA"],
      DIAGNOSTICO: ["EN_PROCESO", "CANCELADA"],
      EN_PROCESO: ["LISTA", "CANCELADA"],
      LISTA: ["ENTREGADA", "CANCELADA"],
      ENTREGADA: [],
      CANCELADA: []
    };

    if (!transitions[currentStatus].includes(toStatus)) {
      return res.status(400).json({
        error: `Transición inválida de ${currentStatus} a ${toStatus}`
      });
    }

    order.status = toStatus;
    await order.save();

    // Registrar en historial
    await StatusHistory.create({
      work_order_id: order.id,
      from_status: currentStatus,
      to_status: toStatus,
      note: note || null,
      changed_by_user_id: req.user.id
    });

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/work-orders/:id/history
 * Retorna el historial de cambios de estado de una orden.
 */
exports.getStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 50 } = req.query;

    // Verificar que la orden existe
    const order = await WorkOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const history = await StatusHistory.findAndCountAll({
      where: { work_order_id: id },
      include: {
        model: User,
        attributes: ["id", "name", "email", "role"]
      },
      order: [["createdAt", "DESC"]],
      limit: parseInt(pageSize),
      offset: (page - 1) * pageSize
    });

    res.json({
      total: history.count,
      data: history.rows
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { faultDescription, BikeId } = req.body;

    const order = await WorkOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: "Orden no encontrada" });

    if (faultDescription !== undefined) order.faultDescription = faultDescription;
    if (BikeId) order.BikeId = BikeId;

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await WorkOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: "Orden no encontrada" });

    await order.destroy();
    res.json({ message: "Orden eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};