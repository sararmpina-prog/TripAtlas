import { ValidationError } from '../utils/appErrors.js';

// Um único middleware que aceita qualquer schema do Zod como argumento
export const validateBody = (schema) => (req, res, next) => {
  try {
    // Altera o req.body para os dados já limpos/normalizados pelo Zod
    req.body = schema.parse(req.body || {});
    next();
  } catch (error) {
    // Apanha o erro do Zod e passa para o errorHandler
    if (error.name === 'ZodError' || error.errors) {
      const firstError = error.errors[0];
      return next(new ValidationError(firstError.message));
    }
    next(error);
  }
};
