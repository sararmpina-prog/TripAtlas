/* Controller responsável por interceptar os pedidos HTTP do Chat da AI 
   e responder com as sugestões geradas pela Gemini. */

import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as aiService from '../services/aiService.js';

export const postChatMessage = asyncHandler(async (req, res) => {
  const { chat_id, user_message } = req.body;

    const trip_id = req.params.tripId 
    ? Number(req.params.tripId) 
    : null;

  const aiResult = await aiService.handleAssistantMessage({
    user_id: req.user.id,
    trip_id,
    chat_id,
    user_message,
  });

  res.json({
    success: true,
    data: aiResult
  });
});
