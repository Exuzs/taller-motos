const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const { body, validationResult } = require('express-validator');

const {
  createBike,
  getBikes,
  getBikeById,
  updateBike,
  deleteBike
} = require("../controllers/bikeController");

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

// Validaciones para crear moto
const createBikeValidation = [
  body('placa')
    .trim()
    .notEmpty()
    .withMessage('Placa es obligatoria')
    .isLength({ max: 20 })
    .withMessage('Placa no puede superar los 20 caracteres'),
  body('clientId')
    .trim()
    .isInt({ min: 1 })
    .withMessage('ID de cliente debe ser un entero positivo'),
  body('brand')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Marca no puede estar vacía')
    .isLength({ max: 50 })
    .withMessage('Marca no puede superar los 50 caracteres'),
  body('model')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Modelo no puede estar vacío')
    .isLength({ max: 50 })
    .withMessage('Modelo no puede superar los 50 caracteres'),
  body('cylinder')
    .optional()
    .trim()
    .isInt({ min: 1, max: 2000 })
    .withMessage('Cilindrada debe ser un entero positivo y razonable')
];

// Validaciones para actualizar moto
const updateBikeValidation = [
  body('placa')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Placa no puede estar vacía')
    .isLength({ max: 20 })
    .withMessage('Placa no puede superar los 20 caracteres'),
  body('clientId')
    .optional()
    .trim()
    .isInt({ min: 1 })
    .withMessage('ID de cliente debe ser un entero positivo'),
  body('brand')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Marca no puede estar vacía')
    .isLength({ max: 50 })
    .withMessage('Marca no puede superar los 50 caracteres'),
  body('model')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Modelo no puede estar vacío')
    .isLength({ max: 50 })
    .withMessage('Modelo no puede superar los 50 caracteres'),
  body('cylinder')
    .optional()
    .trim()
    .isInt({ min: 1, max: 2000 })
    .withMessage('Cilindrada debe ser un entero positivo y razonable')
];

router.use(authenticate);

router.post("/bikes", authorize("ADMIN"), createBikeValidation, handleValidationErrors, createBike);
router.get("/bikes", getBikes);
router.get("/bikes/:id", getBikeById);
router.put("/bikes/:id", authorize("ADMIN"), updateBikeValidation, handleValidationErrors, updateBike);
router.delete("/bikes/:id", authorize("ADMIN"), deleteBike);

module.exports = router;