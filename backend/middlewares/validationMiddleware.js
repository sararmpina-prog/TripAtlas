import { ZodError } from 'zod'; // Importação adicionada para segurança
import { ValidationError } from '../utils/appErrors.js';

export const validateBody = (schema) => (req, res, next) => {
  try {
    console.log("req.body é middleware", req.body);
    // Altera o req.body para os dados limpos/normalizados pelo Zod
    req.body = schema.parse(req.body || {});
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: typeof issue.path?.[0] === 'string' ? issue.path[0] : null,
        message: issue.message,
      }));

      const message = details
        .map((detail) => detail.message)
        .join(' '); // Junta todas as mensagens de erro numa string única

      return next(new ValidationError(message, details));
    }
    
    // Passa qualquer outro erro inesperado para o errorHandler global
    next(error);
  }
};
