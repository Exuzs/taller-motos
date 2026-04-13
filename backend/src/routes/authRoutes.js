const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const { login, register, me } = require("../controllers/authController");

// Rate limiter para login: máximo 5 intentos por minuto por IP
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: { error: "Demasiados intentos. Intente nuevamente en un minuto." },
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/auth/login", loginLimiter, login);
router.post("/auth/register", authenticate, authorize("ADMIN"), register);
router.get("/auth/me", authenticate, me);

module.exports = router;
