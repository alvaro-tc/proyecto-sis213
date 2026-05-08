const rateLimit = require("express-rate-limit");

// Auth: 10 intentos cada 15 min por IP — suficiente para humanos, frena bots.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Demasiados intentos. Intente nuevamente en unos minutos.",
  },
});

module.exports = { authLimiter };
