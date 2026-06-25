/* 
Responsável por:
    - extrair function calls dos parts
    - logar chamadas pedidas
    - executar create_trip_journal_entry
    - montar tool message para voltar ao histórico
*/

import { createAiSuggestion } from '../../../repository/chatRepository.js';

export function getFunctionCallsFromParts(parts = []) {
  // Filtra array, elementos que tem functionCall e depois transforma cada objeto no valor dessa propriedade functionCall
  return parts.filter((p) => p.functionCall).map((p) => p.functionCall);
}

export function logRequestedFunctionCalls(currentResponse, functionCalls) {
  // Mostrar chamadas
  const callsToLog = currentResponse?.functionCalls || functionCalls;
  callsToLog.forEach((fn) => {
    console.log(`➡️ ${fn.name}`, fn.args);
  });
}

/*
 * ================================
 * 5. EXECUTAR FUNCOES (SIMULACAO)
 * ================================
 */
export async function executeFunctionCalls(parts, { trip_id, user_id }) {
  const functionParts = parts.filter((p) => p.functionCall);

  const functionResults = await Promise.all(
    functionParts.map(async (p) => {
      const fn = p.functionCall;
      let result;

      switch (fn.name) {
        case 'create_trip_journal_entry':
          result = await createAiSuggestion({ ...fn.args, trip_id, user_id });
          break;

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

export function buildToolMessage(functionResults) {
  // Adicionar function responses ao historico
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
