import 'dotenv/config';
import {callGemini} from '../infra/ai/callGemini.js'
import * as tripRepository from '../repository/tripRepository.js'
import * as chatRepository from '../repository/chatRepository.js';


console.log('API Key in service:', process.env.GEMINI_API_KEY ? 'LOADED' : 'NOT LOADED');


// Call to API gemini, if returns answer calls "save message" for DB otherwise returns "no message"
export async function sendPromptService({ user_id, trip_id = null, chat_id, user_message }) {
    if (!user_message || typeof user_message !== 'string') {
        throw new ValidationError('Invalid user message provided.');
    }
    
   console.log("estou no send prompt service")   
   console.log("User id é", user_id)
   console.log("trip id é", trip_id)
   console.log("chat id é", chat_id)
 
    let prompt = user_message
    console.log("prompt", prompt)

    let tripContext; 
    if (trip_id !== null && trip_id !== undefined) {
    const trip = await tripRepository.findTripById(trip_id);

    if (!trip) {
      throw new NotFoundError('Trip not found.');
    }

    if (Number(trip.user_id) !== Number(user_id)) {
      throw new ForbiddenError('You do not have access to this trip chat.');
    }

    tripContext = trip;
  }

    const response = await callGemini(prompt, trip_id, chat_id, user_id);

    if (!response || !response.message) {
      console.log("Resposta inválida do Gemini");
      return {
        success: false,
        message: "Sem resposta do modelo"
    };
  }

    console.log('Gemini Response:', response.message);

    await chatRepository.saveChat({
    user_id,
    trip_id: trip_id ?? null,
    user_message: user_message.trim(),
    ai_response: response.message,
    chat_id: chat_id
    });

   // Devolve a resposta limpa para o Controlador entregar ao Frontend
  return {
    reply: response.message,
    chat_id: chat_id
  };
 
}



