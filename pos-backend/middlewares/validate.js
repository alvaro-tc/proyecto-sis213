const createHttpError = require("http-errors");

/**
 * Middleware factory para validar req.body con un esquema Zod.
 * Devuelve 400 con un mensaje legible si la validación falla.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path.join(".") || "input";
    return next(createHttpError(400, `${field}: ${issue.message}`));
  }
  req.body = result.data;
  next();
};

module.exports = validate;
