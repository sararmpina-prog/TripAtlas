/* Controller responsável por interceptar os pedidos HTTP do Chat da AI 
   e responder com as sugestões geradas pela Gemini. */

import { asyncHandler } from '../../middlewares/asyncHandler.js'
import * as aiService from '../ai_Pina/chatServiceTeste.js';
import * as chatRepository from '../../repository/chatRepository.js';
import { v4 as uuidv4 } from 'uuid';


// GET /api/ai/chats
export const getChatSessions = asyncHandler(async (req, res) => {

  const chats = await chatRepository.getChatSessions(req.user.id);

  res.json({
    success: true,
    data: chats
  });
});




export const getChatHistory = asyncHandler(async (req, res) => {
  const { chatId } = req.params;


  console.log("chatId", chatId)

  const messages = await chatRepository.getMessagesByChatId({
    user_id: req.user.id,
    chat_id: chatId
  });

  res.json({
    success: true,
    data: messages
  });
});



export const postChatMessage = asyncHandler(async (req, res) => {
  console.log("Estou no controller")
  console.log("REQ USER:", req.user);
   const { chat_id, user_message } = req.body;

   const finalChatId = chat_id || uuidv4();
  
      const trip_id = req.params.tripId 
      ? Number(req.params.tripId) 
      : null;
  
    const aiResult = await aiService.sendPromptService({
      user_id: req.user.id,
      trip_id,
      chat_id: finalChatId,
      user_message,
    });
  
    res.json({
      success: true,
      data: {
      chat_id: finalChatId,
      ...aiResult
    }
    });
});
