import { ZodError } from 'zod'; // Importação adicionada para segurança
import { ValidationError } from '../utils/appErrors.js';

export const validateBody = (schema) => (req, res, next) => {
  try {
    // Altera o req.body para os dados limpos/normalizados pelo Zod
    req.body = schema.parse(req.body || {});
    next();
  } catch (error) {
    // Verifica de forma segura se é um erro do Zod e se tem mensagens
    if (error instanceof ZodError && error.issues && error.issues.length > 0) {
      const firstError = error.issues[0];
      return next(new ValidationError(firstError.message));
    }
    
    // Passa qualquer outro erro inesperado para o errorHandler global
    next(error);
  }
};
