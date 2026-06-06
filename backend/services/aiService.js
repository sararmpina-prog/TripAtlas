/* Service de Inteligência Artificial (TripAtlas AI Agent)
   Garante o fluxo de chat focado no destino e armazena o histórico em snake_case. */

import * as tripRepository from '../repository/tripRepository.js';
import * as chatRepository from '../repository/chatRepository.js';
import { callGeminiWithContents } from '../infra/ai/callGemini.js';
import { buildTripAssistantSystemPrompt } from '../prompts/tripAssistantPrompt.js';
import { buildTripBotConfig } from '../infra/ai/tripBotConfig.js';
import { buildConversationContents } from './chatHistoryBuilder.js';
import {
  hydrateHistoryByTrip,
  getHistoryByTrip,
  getSummaryByTrip,
  limitHistoryWithSummaryByTrip
} from './chatService.js';

// Processa a mensagem do utilizador no chat de uma viagem e devolve a resposta da AI
// @param {number} trip_id - ID da viagem ativa no chat
// @param {string} user_message - Mensagem enviada pelo utilizador
// @returns {object} Resposta estruturada com o texto da IA
export async function handleTripAssistantMessage(trip_id, user_message) {
  if (!user_message || typeof user_message !== 'string') {
    throw new Error('Invalid user message provided.');
  }

  // Hidrata o histórico em RAM a partir do SQL (apenas no primeiro turno)
  await hydrateHistoryByTrip(trip_id);
  const history = getHistoryByTrip(trip_id);
  const summary = getSummaryByTrip(trip_id);

  // Consulta os dados reais da viagem na base de dados para dar contexto à IA
  const tripRows = await tripRepository.findTripById(trip_id);
  const tripContext = tripRows || {}; // Dados: destination, start_date, etc.

  // Constrói o System Prompt dinâmico (a vossa fusão em inglês com regras de segurança)
  const systemPrompt = buildTripAssistantSystemPrompt(tripContext);
  const geminiConfig = buildTripBotConfig(systemPrompt);

  // Junta a nova mensagem do utilizador ao histórico ativo na RAM
  history.push({
    role: 'user',
    parts: [{ text: user_message.trim() }]
  });

  // Constrói a estrutura final (Histórico Recente + Resumo Incremental) para enviar ao SDK
  const contents = buildConversationContents(history, summary);

  // Executa a chamada real à infraestrutura genérica da Gemini
  const ai_response = await callGeminiWithContents(contents, undefined, geminiConfig);

  // Junta a resposta da IA ao histórico na RAM
  history.push({
    role: 'model',
    parts: [{ text: ai_response }]
  });

  // Aplica a compressão automática em RAM se o chat já tiver mais de 5 turnos
  await limitHistoryWithSummaryByTrip(trip_id);

  // Grava permanentemente a interação no SQL em snake_case puro
  await chatRepository.saveChat({
    trip_id,
    user_message: user_message.trim(),
    ai_response
  });

  // Devolve a resposta limpa para o Controlador entregar ao Frontend
  return {
    reply: ai_response
  };
}
