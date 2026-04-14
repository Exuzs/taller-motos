const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const { body, validationResult } = require('express-validator');

const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
} = require("../controllers/clientController");

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

// Validaciones para crear cliente
const createClientValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nombre es obligatorio')
    .isLength({ max: 100 })
    .withMessage('Nombre no puede superar los 100 caracteres'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 25 })
    .withMessage('Teléfono no puede superar los 25 caracteres'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Email debe ser válido si se proporciona')
    .isLength({ max: 100 })
    .withMessage('Email no puede superar los 100 caracteres')
];

// Validaciones para actualizar cliente
const updateClientValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nombre no puede estar vacío')
    .isLength({ max: 100 })
    .withMessage('Nombre no puede superar los 100 caracteres'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 25 })
    .withMessage('Teléfono no puede superar los 25 caracteres'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Email debe ser válido')
    .isLength({ max: 100 })
    .withMessage('Email no puede superar los 100 caracteres')
];

router.use(authenticate);

router.post("/clients", authorize("ADMIN"), createClientValidation, handleValidationErrors, createClient);
router.get("/clients", getClients);
router.get("/clients/:id", getClientById);
router.put("/clients/:id", authorize("ADMIN"), updateClientValidation, handleValidationErrors, updateClient);
router.delete("/clients/:id", authorize("ADMIN"), deleteClient);

module.exports = router;