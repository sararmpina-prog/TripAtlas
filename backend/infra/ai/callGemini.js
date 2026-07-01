/* Camada genérica de comunicação com a Gemini.

Responsabilidades:
- validar configuração base
- executar chamadas ao provider utilizando o SDK oficial @google/genai
- aplicar retry/fallback de modelos
- devolver texto ou resposta bruta

Esta camada não conhece prompts, tools nem comportamento específico do assistente.
*/

import 'dotenv/config';
import {config} from './tripBotConfig.js'
import {createAiSuggestion} from '../../repository/chatRepository.js'
import { logGeminiDebug } from './aiDebugLogger.js';
import {generateWithFallback} from './modelsFallback.js'
import {summarizeHistory} from './summarizeHistory.js';
import {TripJournalEntrySchema} from '../../validators/journalValidor.js'
import * as chatRepository from '../../repository/chatRepository.js';




//Call Api Gemini (single function definition)
export async function callGemini(userPrompt, trip_id = null, chat_id, user_id) {

let history = [];

history =
    await chatRepository.getHistoryForGemini({
      user_id,
      chat_id
    });

  history.push({
    role: "user",
    parts: [
      {
        text: userPrompt
      }
    ]
  });

  console.log(
    "History sent to Gemini:",
    JSON.stringify(history, null, 2)
  );

  console.log("Histórico da conversa (primeiro push)", history)
  console.log("Histórico:", JSON.stringify(history, null, 2))

  try {


let currentResponse = await generateWithFallback(history, config);

console.log(JSON.stringify(currentResponse, null, 2));

  let step = 1;
  const MAX_STEPS = 5;

  while ( step <= MAX_STEPS) {

  const parts = currentResponse?.candidates?.[0]?.content?.parts || [];

  console.log("parts =", parts)

  if (parts && parts.length > 0) {
  console.log("parts existe e length maior que zero")  
  history.push({
    role: "model",
    parts
  });
}  

 console.log("Histórico da conversa (resposta Gemini)", history)
  console.log("Histórico:", JSON.stringify(history, null, 2))

  console.log("parts", parts)
  console.log(`🔁 STEP ${step}`);
  console.log("Funções pedidas pelo modelo:");


  //Filtra array, elementos que tem functionCall e depois transforma cada objeto no valor dessa propriedade functionCall
  const functionCalls = parts.filter(p => p.functionCall).map(p => p.functionCall)

  console.log("functionCalls =", functionCalls);


 //Se não existir, sai do loop 
 if (functionCalls.length == 0) { break}

    // Mostrar chamadas
   currentResponse.functionCalls.forEach(fn => {
    console.log(`➡️ ${fn.name}`, fn.args);
  });
  

/*
 * ================================
 * 5. EXECUTAR FUNÇÕES (SIMULAÇÃO)
 * ================================
 */
    const functionResults = await Promise.all(currentResponse.candidates[0].content.parts
    .filter(p => p.functionCall)
    .map(async (p) => {

    const fn = p.functionCall;  
    let result;

      

    switch (fn.name) {
      case 'create_trip_journal_entry':
        //  const data = TripJournalEntrySchema.parse({
        //     ...fn.args,
        //     trip_id,
        //     user_id,
        //   });


        result = await createAiSuggestion({
            ...fn.args,
            trip_id,
            user_id,
          });
        break;

      default:
      result = { error: 'Unknown function' };
    }

    console.log(`✅ Executada: ${fn.name}`, result);

    return {
      name: fn.name,
      response: result ?? {},
      thought_signature: fn.thought_signature
    };
  }));

      // Adicionar function responses ao histórico
      const toolMessage = {
        role: "tool",
        parts: functionResults.map(fr => ({
          functionResponse: {
            name: fr.name,
            response:  fr.response  ?? {}
          }
        }))};

      history.push(toolMessage);

       console.log("Histórico da conversa (resposta Gemini execução funções)", history)
      console.log("Histórico:", JSON.stringify(history, null, 2))

      if (history.length > 20) {

        const oldHistory = history.slice(0, -10);
        const recent = history.slice(-10);

        summary = await summarizeHistory(oldHistory);

        history = [
          {
            role: "user",
            parts: [{
              text: "Resumo da conversa anterior:\n" + summary
            }]
          },
          ...recent
        ];
      }

      
  // Pedir próxima resposta ao Gemini
  currentResponse = await generateWithFallback(history, config);
    step++;
    console.log("currentResponse", currentResponse) 
  }

  
  const finalParts =
  currentResponse?.candidates?.[0]?.content?.parts || [];

  console.log("final parts", finalParts)

  let finalText =
  finalParts.find(p => p.text)?.text;

  console.log("finalText", finalText)
 

  if (finalText) {
    finalText = finalText?.trim()
  }



  const finalResponse = {
      success: true,
      message: finalText
    
    };

    return finalResponse
 
      
} catch (error) {

 logGeminiDebug(
  'function-calling',
  'gemini-error',
  {
    message: error.message,
    response: error.response?.data,
    stack: error.stack
  }
);

  throw error
    }
  }







