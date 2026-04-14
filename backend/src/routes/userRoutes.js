const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const { body, validationResult } = require('express-validator');
const { getUsers, updateUser } = require("../controllers/userController");

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

// Validaciones para actualizar usuario
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nombre no puede estar vacío')
    .isLength({ max: 100 })
    .withMessage('Nombre no puede superar los 100 caracteres'),
  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email no puede estar vacío')
    .isEmail()
    .withMessage('Email debe ser válido')
    .isLength({ max: 100 })
    .withMessage('Email no puede superar los 100 caracteres'),
  body('password')
    .optional()
    .isLength({ min: 6, max: 128 })
    .withMessage('Contraseña debe tener entre 6 y 128 caracteres'),
  body('role')
    .optional()
    .trim()
    .isIn(['ADMIN', 'MECANICO'])
    .withMessage('Rol debe ser ADMIN o MECANICO'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser un booleano')
];

router.get("/users", authenticate, authorize("ADMIN"), getUsers);
router.patch("/users/:id", authenticate, authorize("ADMIN"), updateUserValidation, handleValidationErrors, updateUser);
router.delete("/users/:id", authenticate, authorize("ADMIN"), exports.deleteUser = require("../controllers/userController").deleteUser);

module.exports = router;
