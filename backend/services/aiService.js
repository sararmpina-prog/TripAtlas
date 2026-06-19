/* Service de Inteligência Artificial (TripAtlas AI Agent)
   Garante o fluxo de chat focado no destino e armazena o histórico em snake_case. */

import * as tripRepository from '../repository/tripRepository.js';
import * as chatRepository from '../repository/chatRepository.js';
import { callGeminiWithContents } from '../infra/ai/callGemini.js';
import { buildTripAssistantSystemPrompt } from '../infra/ai/prompts/tripAssistantPrompt.js';
import { buildTripBotConfig } from '../infra/ai/tripBotConfig.js';
import { buildConversationContents } from './chatHistoryBuilder.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/appErrors.js';
import {
  getHistory,
  getSummary,
  hydrateHistory,
  limitHistoryWithSummary,
} from './chatService.js';

// Processa a mensagem do utilizador e devolve a resposta da AI.
// @param {string} user_message - Mensagem enviada pelo utilizador
// @returns {object} Resposta estruturada com o texto da IA
export async function handleAssistantMessage({ user_id, trip_id = null, user_message }) {
  if (!user_message || typeof user_message !== 'string') {
    throw new ValidationError('Invalid user message provided.');
  }

  const chatScope = {
    user_id,
    trip_id: trip_id ?? null,
  };

  await hydrateHistory(chatScope);
  const history = getHistory(chatScope);
  const summary = getSummary(chatScope);

  let tripContext = {};

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

  await limitHistoryWithSummary(chatScope);

  await chatRepository.saveChat({
    user_id,
    trip_id: trip_id ?? null,
    user_message: user_message.trim(),
    ai_response
  });

  // Devolve a resposta limpa para o Controlador entregar ao Frontend
  return {
    reply: ai_response
  };
}
