/* Faz-se esta validação do input ANTES da chamada à AI para evitar requests desnecessárias.

Se alguma dessas condições for verdadeira, cria um ValidationError e passa para o próximo middleware (errorHandler) para enviar uma resposta de erro padronizada para o cliente.
*/
import { z } from 'zod';
import { validateBody } from '../middlewares/validationMiddleware.js';

const chatSchema = z.object({
  message: z.string({ required_error: 'The field "message" is mandatory.' })
    .trim()
    .min(1, { message: 'The field "message" cannot be empty.' })
});

// Nas rotas de IA basta usar: validateBody(chatSchema)
