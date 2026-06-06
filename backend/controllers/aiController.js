/* Controller responsável por interceptar os pedidos HTTP do Chat da AI 
   e responder com as sugestões geradas pela Gemini. */

import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as aiService from '../services/aiService.js';

export const postChatMessage = asyncHandler(async (req, res) => {
  // O trip_id vem validado pelo middleware de parâmetros da URL
  const { tripId } = req.params;
  const { user_message } = req.body;

  // Executa o loop principal de conversação da IA
  const aiResult = await aiService.handleTripAssistantMessage(tripId, user_message);

  // Responde no padrão JSON limpo
  res.json({
    success: true,
    data: aiResult // Contém o objeto { reply: "..." }
  });
});
