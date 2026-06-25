/* 
Orquestrador do fluxo de function-calling do Gemini:
    - chama build history
    - chama Gemini com fallback
    - ciclo de function-calling
    - compactação
    - resposta final
    - tratamento de erro com logGeminiDebug
*/

import 'dotenv/config';
import { config } from './tripBotConfig.js';
import { logGeminiDebug } from './aiDebugLogger.js';
import { generateWithFallback } from './modelsFallback.js';

import { buildHistoryWithUserPrompt } from './sara/historyBuilderSara.js';
import {
  buildToolMessage,
  executeFunctionCalls,
  getFunctionCallsFromParts,
  logRequestedFunctionCalls,
} from './sara/functionExecutionSara.js';
import { compactHistoryIfNeeded } from './sara/historySummarySara.js';
import { buildFinalResponseFromGemini } from './sara/finalResponseSara.js';




//Call Api Gemini (single function definition)
export async function callGemini(userPrompt, trip_id = null, chat_id, user_id) {
  let history = await buildHistoryWithUserPrompt(userPrompt, chat_id, user_id);

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
  const functionCalls = getFunctionCallsFromParts(parts);

  console.log("functionCalls =", functionCalls);


 //Se não existir, sai do loop 
 if (functionCalls.length == 0) { break}

    // Mostrar chamadas
    logRequestedFunctionCalls(currentResponse, functionCalls);
  

/*
 * ================================
 * 5. EXECUTAR FUNÇÕES (SIMULAÇÃO)
 * ================================
 */
    const functionResults = await executeFunctionCalls(parts, { trip_id, user_id });

      // Adicionar function responses ao histórico
      const toolMessage = buildToolMessage(functionResults);

      history.push(toolMessage);

       console.log("Histórico da conversa (resposta Gemini execução funções)", history)
      console.log("Histórico:", JSON.stringify(history, null, 2))

      history = await compactHistoryIfNeeded(history);

      
  // Pedir próxima resposta ao Gemini
  currentResponse = await generateWithFallback(history, config);
    step++;
    console.log("currentResponse", currentResponse) 
  }

  
    const finalResponse = buildFinalResponseFromGemini(currentResponse);

    return finalResponse;
 
      
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