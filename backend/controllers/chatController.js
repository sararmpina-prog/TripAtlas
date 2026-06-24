/* Controller responsável por interceptar os pedidos HTTP do Chat da AI 
   e responder com as sugestões geradas pela Gemini. */

import { asyncHandler } from '../middlewares/asyncHandler.js'
import * as aiService from '../services/chatService.js';
import * as chatRepository from '../repository/chatRepository.js';
import { v4 as uuidv4 } from 'uuid';


// GET /api/ai/chats
export const getChatSessions = asyncHandler(async (req, res) => {

  const chats = await chatRepository.getChatSessions(req.user.id);

  res.json({
    success: true,
    data: chats
  });
});


// GET /api/ai/chatId
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


// POST /api/ai/chat
export const postChatMessage = asyncHandler(async (req, res) => {
  console.log("Estou no controller")
  console.log("REQ USER:", req.user);
  console.log("RAW BODY:", req.body);
  console.log("CHAT_ID TYPE:", typeof req.body.chat_id);

  const { user_message, chat_id } = req.validatedBody;

  console.log("controller do post, chat id é", chat_id)

  const finalChatId = chat_id || uuidv4();

  console.log("controller do post, chat id é", finalChatId)

  const trip_id =
  req.params?.tripId
    ? Number(req.params.tripId)
    : req.validatedBody.trip_id ?? null;
  
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
