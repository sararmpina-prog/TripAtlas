/* Orquestrador do fluxo da conversa com o Gemini.
 *
 * Responsabilidades:
 *  - construir o histórico com a mensagem do utilizador (via historyBuilder)
 *  - chamar o provider Gemini com fallback (via modelsFallback)
 *  - ciclo de function-calling até MAX_STEPS (via toolExecutor)
 *  - compactação do histórico quando fica muito longo (via historyCompactor)
 *  - extrair e devolver a resposta final (via responseParser)
 *  - logging de erros técnicos (via aiDebugLogger)
 */

import 'dotenv/config';
import { buildTripBotConfig } from '../config/tripAssistantConfig.js';
import { logGeminiDebug } from '../provider/aiDebugLogger.js';
import { callGemini } from '../provider/callGemini.js'; // A callGemini faz a validação do histórico e da config, e depois chama o generateWithFallback 
import * as tripRepository from '../../../repository/tripRepository.js';

import { buildHistoryWithUserPrompt } from './historyBuilder.js';
import {
  buildToolMessage,
  executeFunctionCalls,
  getFunctionCallsFromParts,
  logRequestedFunctionCalls,
} from './toolExecutor.js';
import { compactHistoryIfNeeded } from './historySummary.js';
import { buildFinalResponseFromGemini } from './responseParser.js';


export async function handleTripBotFlow(userPrompt, trip_id = null, chat_id, user_id) {
  let history = await buildHistoryWithUserPrompt(userPrompt, chat_id, user_id);


  try {
    // Criação da configuração dinâmica em tempo real:
    let tripContext = {};
    if (trip_id) {
      tripContext = await tripRepository.findTripById(trip_id) || {};
    }

    // Passamos o "user_id" (que vem do argumento da função) como o primeiro parâmetro,
    // e o objeto "tripContext" como o segundo parâmetro
    const dynamicConfig = buildTripBotConfig(user_id, tripContext);

    // Primeira chamada protegida com o dynamicConfig
    let currentResponse = await callGemini(history, dynamicConfig);

    console.log(JSON.stringify(currentResponse, null, 2));

    let step = 1;
    const MAX_STEPS = 5;

    while (step <= MAX_STEPS) {

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
      if (functionCalls.length == 0) { break }

      // Mostrar chamadas
      logRequestedFunctionCalls(currentResponse, functionCalls);

      /*
       * ================================
       * 5. EXECUTAR FUNÇÕES (SIMULAÇÃO)
       * ================================
       */
      // Executa as chamadas de funções (Tradução de nome para ID ativada)
      const functionResults = await executeFunctionCalls(parts, { trip_id, user_id });
      
      // Adicionar function responses ao histórico
      const toolMessage = buildToolMessage(functionResults);

      history.push(toolMessage);

      console.log("Histórico da conversa (resposta Gemini execução funções)", history)
      console.log("Histórico:", JSON.stringify(history, null, 2))

      history = await compactHistoryIfNeeded(history);

      // Pedir próxima resposta ao Gemini
      currentResponse = await callGemini(history, dynamicConfig);
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

    throw error;
  }
}
