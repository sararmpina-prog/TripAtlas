/* Responsável por:
 *  - extrair function calls dos parts da resposta Gemini
 *  - logar as chamadas pedidas pelo modelo
 *  - executar as ferramentas disponíveis (ex: create_trip_journal_entry)
 *  - montar a tool message para voltar ao histórico
 */

import { createAiSuggestion } from '../../../repository/chatRepository.js';

// Filtra array, elementos que tem functionCall e depois transforma cada objeto no valor dessa propriedade functionCall
export function getFunctionCallsFromParts(parts = []) {
  return parts.filter((p) => p.functionCall).map((p) => p.functionCall);
}

// Mostrar chamadas pedidas pelo modelo no terminal
export function logRequestedFunctionCalls(currentResponse, functionCalls) {
  const callsToLog = currentResponse?.functionCalls || functionCalls;
  callsToLog.forEach((fn) => {
    console.log(`➡️ ${fn.name}`, fn.args);
  });
}

/*
 * ================================
 * EXECUTAR FUNÇÕES (SIMULAÇÃO)
 * ================================
 */
export async function executeFunctionCalls(parts, { trip_id, user_id }) {
  const functionParts = parts.filter((p) => p.functionCall);

  const functionResults = await Promise.all(
    functionParts.map(async (p) => {
      const fn = p.functionCall;
      let result;

      switch (fn.name) {
        case 'create_trip_journal_entry': {
          // SE O CONTEXTO FOR NULO, BUSCAMOS O ID PELO NOME QUE A GEMINI ENVIOU
          let finalTripId = trip_id;
          
          if (!finalTripId && fn.args.trip_name) {
            const tripRow = await tripRepository.getTripByName(fn.args.trip_name);
            finalTripId = tripRow?.id || null;
          }

          if (!finalTripId) {
            result = { error: `Trip context not found for name: ${fn.args.trip_name || 'unknown'}` };
            break;
          }

          // CHAMADA LIMPA: Passamos os argumentos reais para as colunas estruturais (id, title, content)
          result = await createAiSuggestion(
            finalTripId, 
            fn.args.title || 'AI Suggestion', 
            fn.args.content || fn.args.text_content || ''
          );
          break;
        }

        default:
          result = { error: 'Unknown function' };
      }

      console.log(`✅ Executada: ${fn.name}`, result);

      return {
        name: fn.name,
        response: result ?? {},
        thought_signature: fn.thought_signature,
      };
    })
  );

  return functionResults;
}

// Adicionar function responses ao histórico no formato esperado pelo Gemini
export function buildToolMessage(functionResults) {
  return {
    role: 'tool',
    parts: functionResults.map((fr) => ({
      functionResponse: {
        name: fr.name,
        response: fr.response ?? {},
      },
    })),
  };
}
