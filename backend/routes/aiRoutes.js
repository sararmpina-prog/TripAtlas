/* Rotas REST para interagir com o agente conversacional da Gemini. */

import express from 'express';
import { postChatMessage } from '../controllers/aiController.js';
import { validateIdParam } from '../middlewares/validateIdParams.js';
import { validateBody } from '../middlewares/validationMiddleware.js';
import { chatMessageSchema } from '../validators/aiValidator.js';

const router = express.Router();

// POST /api/ai/chat/:tripId
router.post(
  '/chat/:tripId', 
  validateIdParam('tripId'), 
  validateBody(chatMessageSchema), // Adicionada a barreira de validação do texto do chat
  postChatMessage
);

export default router;
