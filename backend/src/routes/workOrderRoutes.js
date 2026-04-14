const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const { body, validationResult } = require('express-validator');

const {
  createWorkOrder,
  getWorkOrders,
  getWorkOrderById,
  updateStatus,
  addItem,
  deleteItem,
  getStatusHistory
} = require("../controllers/workOrderController");

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(err => ({ field: err.param, message: err.msg }));
    return res.status(400).json({
      error: formatted[0].message,
      errors: formatted
    });
  }
  next();
};

// Validaciones para crear orden de trabajo
const createWorkOrderValidation = [
  body('motoId')
    .trim()
    .isInt({ min: 1 })
    .withMessage('ID de moto debe ser un entero positivo'),
  body('faultDescription')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Descripción de falla no puede estar vacía')
    .isLength({ max: 500 })
    .withMessage('Descripción de falla no puede superar los 500 caracteres')
];

// Validaciones para agregar item
const addItemValidation = [
  body('type').isIn(['MANO_OBRA', 'REPUESTO']).withMessage('Tipo debe ser MANO_OBRA o REPUESTO'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Descripción no puede estar vacía')
    .isLength({ max: 255 })
    .withMessage('Descripción no puede superar los 255 caracteres'),
  body('count')
    .trim()
    .isInt({ min: 1 })
    .withMessage('Cantidad debe ser un entero mayor a 0'),
  body('unitValue')
    .trim()
    .isFloat({ min: 0 })
    .withMessage('Valor unitario debe ser un número mayor o igual a 0')
];

const VALID_WORK_ORDER_STATUSES = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'];

// Validaciones para actualizar orden de trabajo
const updateWorkOrderValidation = [
  body('faultDescription')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Descripción de falla no puede estar vacía')
    .isLength({ max: 500 })
    .withMessage('Descripción de falla no puede superar los 500 caracteres'),
  body('BikeId')
    .optional()
    .trim()
    .isInt({ min: 1 })
    .withMessage('ID de moto debe ser un entero positivo')
];

// Validaciones para cambiar estado de orden
const updateWorkOrderStatusValidation = [
  body('toStatus')
    .optional()
    .trim()
    .isIn(VALID_WORK_ORDER_STATUSES)
    .withMessage('Estado destino debe ser un valor válido'),
  body('status')
    .optional()
    .trim()
    .isIn(VALID_WORK_ORDER_STATUSES)
    .withMessage('Estado destino debe ser un valor válido'),
  body()
    .custom((value, { req }) => {
      if (!req.body.toStatus && !req.body.status) {
        throw new Error('El estado destino es obligatorio');
      }
      return true;
    })
];

// Todas las rutas requieren autenticación
router.use(authenticate);

router.post("/work-orders", authorize("ADMIN"), createWorkOrderValidation, handleValidationErrors, createWorkOrder);
router.get("/work-orders", getWorkOrders);
router.get("/work-orders/:id", getWorkOrderById);
router.put("/work-orders/:id", authorize("ADMIN"), updateWorkOrderValidation, handleValidationErrors, exports.updateWorkOrder = require("../controllers/workOrderController").updateWorkOrder);
router.delete("/work-orders/:id", authorize("ADMIN"), exports.deleteWorkOrder = require("../controllers/workOrderController").deleteWorkOrder);
router.patch("/work-orders/:id/status", updateWorkOrderStatusValidation, handleValidationErrors, updateStatus);
router.get("/work-orders/:id/history", getStatusHistory);
router.post("/work-orders/:id/items", addItemValidation, handleValidationErrors, addItem);
router.delete("/work-orders/items/:itemId", authorize("ADMIN"), deleteItem);

module.exports = router;