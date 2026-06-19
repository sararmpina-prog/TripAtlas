/* Controller responsável por interceptar os pedidos HTTP do Chat da AI 
   e responder com as sugestões geradas pela Gemini. */

import { asyncHandler } from '../../middlewares/asyncHandler.js'
import * as aiService from '../ai_Pina/chatServiceTeste.js';

export const postChatMessage = asyncHandler(async (req, res) => {
  console.log("Estou no controller")
  console.log("REQ USER:", req.user);
  const { tripId } = req.params;
  const { user_message } = req.body;

  console.log("tripId", tripId)
  const aiResult = await aiService.sendPromptService({
    user_id: req.user.id,
    trip_id: tripId ? Number(tripId) : null,
    user_message,
  });

  res.json({
    success: true,
    data: aiResult
  });
});
