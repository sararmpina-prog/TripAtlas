/* Responsável por:
 *  - extrair function calls dos parts da resposta Gemini
 *  - logar as chamadas pedidas pelo modelo
 *  - executar as ferramentas disponíveis (ex: create_trip_journal_entry)
 *  - montar a tool message para voltar ao histórico
 */

import { createAiSuggestion } from '../../../repository/chatRepository.js';
import * as tripRepository from '../../../repository/tripRepository.js';

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

/* Função Auxiliar: Resolve a referência natural fornecida pelo utilizador */
async function resolveTripReference(tripReference, userId) {
  if (!tripReference) return null;

  console.log(`ToolExecutor a tentar traduzir a referência: "${tripReference}" para o User: ${userId}`);
  
  // Chama o repositório "elástico" (procura por título, destino ou ID)
  const tripRow = await tripRepository.resolveTripReference(tripReference, userId);
  
  console.log("→ Resposta da base de dados no ToolExecutor:", tripRow);

  // Regra de segurança extra: Garante que a viagem encontrada pertence mesmo ao utilizador logado
  if (tripRow && Number(tripRow.user_id) === Number(userId)) {
    return tripRow.id;
  }
  
  return null;
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
          
          const resolvedTripId = await resolveTripReference(
              fn.args.trip_reference,
              user_id
          );
          
          if (!resolvedTripId) {
              result = { 
                error: `Trip reference "${fn.args.trip_reference || 'unknown'}" not found or unauthorized. Please ask the user to clarify the correct trip name.` 
              };
              break;
          }

          const titleText = fn.args.title || 'AI Travel Insight';
          const contentText = fn.args.content || fn.args.text_content || '';

          // Grava usando o trip_id seguro resolvido pela infraestrutura
          result = await createAiSuggestion(resolvedTripId, titleText, contentText);
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
