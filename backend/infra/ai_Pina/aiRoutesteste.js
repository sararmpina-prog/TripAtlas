/* Rotas REST para interagir com o agente conversacional da Gemini. */

import express from 'express';
import { postChatMessage } from '../ai_Pina/chatControllerTeste.js';
import { validateIdParam } from '../../middlewares/validateIdParams.js';
import { validateBody } from '../../middlewares/validationMiddleware.js';
import { getChatHistory } from '../ai_Pina/chatControllerTeste.js';
import { chatMessageSchema } from '../../validators/aiValidator.js';

const router = express.Router();

// GET /api/ai/chat -> chat geral do utilizador autenticado
router.get('/chat/:chatId', getChatHistory);

// POST /api/ai/chat -> chat geral do utilizador autenticado
router.post('/chat', validateBody(chatMessageSchema), postChatMessage);

// POST /api/ai/chat/:tripId -> chat associado a uma viagem específica
// router.post(
//   '/chat/:tripId', 
//   validateIdParam('tripId'), 
//   validateBody(chatMessageSchema),
//   postChatMessage
// );

export default router;