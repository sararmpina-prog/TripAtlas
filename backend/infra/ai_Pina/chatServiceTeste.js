import 'dotenv/config';
import {callGeminiWithFunctionDefinition} from '../ai_Pina/callGeminiTeste.js'
import {db} from "../db/db.js"



console.log('API Key in service:', process.env.GEMINI_API_KEY ? 'LOADED' : 'NOT LOADED');


// Call to API gemini, if returns answer calls "save message" for DB otherwise returns "no message"
export async function sendPromptService(text) {
    
   console.log("estou no send prompt service")   
 
    let prompt = text
    console.log("prompt", prompt)

    const response = await callGeminiWithFunctionDefinition(prompt);

    if (!response || !response.message) {
      console.log("Resposta inválida do Gemini");
      return {
        success: false,
        message: "Sem resposta do modelo"
    };
  }

    console.log('Gemini Response:', response.message);

    await saveMessage(text, response.message);

    return response

 
}