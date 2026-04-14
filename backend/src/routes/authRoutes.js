const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const { body, validationResult } = require('express-validator');
const { login, register, me } = require("../controllers/authController");

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

// Validaciones para login
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email debe ser válido'),
  body('password')
    .exists({ checkFalsy: true })
    .withMessage('Contraseña es obligatoria')
];

// Validaciones para registro
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nombre es obligatorio')
    .isLength({ max: 100 })
    .withMessage('Nombre no puede superar los 100 caracteres'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email es obligatorio')
    .isEmail()
    .withMessage('Email debe ser válido'),
  body('email')
    .isLength({ max: 100 })
    .withMessage('Email no puede superar los 100 caracteres'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Contraseña debe tener entre 6 y 128 caracteres'),
  body('role')
    .optional()
    .trim()
    .isIn(['ADMIN', 'MECANICO'])
    .withMessage('Rol debe ser ADMIN o MECANICO')
];

// Rate limiter para login: máximo 5 intentos por minuto por IP
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: { error: "Demasiados intentos. Intente nuevamente en un minuto." },
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/auth/login", loginLimiter, loginValidation, handleValidationErrors, login);
router.post("/auth/register", authenticate, authorize("ADMIN"), registerValidation, handleValidationErrors, register);
router.get("/auth/me", authenticate, me);

module.exports = router;
