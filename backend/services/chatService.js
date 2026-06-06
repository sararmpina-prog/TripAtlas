/* Gestão de contexto conversacional por Viagem (Trip).
   Persistência definitiva na BD + Cache híbrida em RAM + Compressão contextual. */

import { getChatHistoryByTrip } from '../repository/chatRepository.js';
import { summarizeHistory } from './chatSummaryService.js';

// Indexado por trip_id em vez de userId para não misturar chats de viagens diferentes
const chatStateByTrip = new Map();
const MAX_ACTIVE_HISTORY = 5;

function getTripChatState(trip_id) {
  if (!chatStateByTrip.has(trip_id)) {
    chatStateByTrip.set(trip_id, {
      history: [],
      summary: null,
      hydrated: false, // Indica se já carregamos o histórico completo do SQL para esta viagem
    });
  }

  return chatStateByTrip.get(trip_id);
}

// Lazy hydration: carrega do SQL apenas no primeiro pedido do chat desta viagem
export async function hydrateHistoryByTrip(trip_id) {
  const state = getTripChatState(trip_id);

  if (state.hydrated) {
    return state;
  }

  // Usa a função em snake_case que foi construída no repository
  const persistedHistory = await getChatHistoryByTrip(trip_id);
  state.history.length = 0;
  state.history.push(...persistedHistory);
  state.summary = null;
  state.hydrated = true;

  return state;
}

export function getHistoryByTrip(trip_id) {
  return getTripChatState(trip_id).history;
}

export function getSummaryByTrip(trip_id) {
  return getTripChatState(trip_id).summary;
}

export function clearHistoryByTrip(trip_id) {
  chatStateByTrip.set(trip_id, {
    history: [],
    summary: null,
    hydrated: true,
  });
}

// Mantém apenas os últimos 5 turnos ativos em RAM e comprime o resto
export async function limitHistoryWithSummaryByTrip(trip_id) {
  const state = getTripChatState(trip_id);

  if (state.history.length <= MAX_ACTIVE_HISTORY) return;

  const oldMessages = state.history.slice(0, -MAX_ACTIVE_HISTORY);
  const recentMessages = state.history.slice(-MAX_ACTIVE_HISTORY);

  let newSummary = state.summary;

  try {
    newSummary = await summarizeHistory(oldMessages, state.summary);
  } catch {
    newSummary = state.summary;
  }

  state.summary = newSummary;
  state.history.length = 0;
  state.history.push(...recentMessages);
}
