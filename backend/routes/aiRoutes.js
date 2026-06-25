/* Rotas REST para interagir com o agente conversacional da Gemini. */

import express from 'express';
import { validateBody } from '../middlewares/validationMiddleware.js';
import { chatMessageSchema } from '../validators/aiValidator.js';
import { getChatHistory, getChatSessions, postChatMessage } from '../controllers/chatController.js';

const router = express.Router();

// GET /api/ai/chatId -> chat especifico do utilizador autenticado
router.get('/chat/:chatId',getChatHistory);

// GET /api/ai/chats -> chat geral do utilizador autenticado
router.get('/chats', getChatSessions);

// POST /api/ai/chat -> novo chat do utilizador autenticado
router.post('/chat', validateBody(chatMessageSchema), postChatMessage);

export default router;
