/* Gestão de contexto conversacional por âmbito de chat.
   Persistência definitiva na BD + Cache híbrida em RAM + Compressão contextual. */

import { getChatHistory } from '../repository/chatRepository.js';
import { summarizeHistory } from './chatSummaryService.js';

const chatStateByScope = new Map();
const MAX_ACTIVE_HISTORY = 5;

function getChatScopeKey({ user_id, trip_id = null }) {
  return trip_id === null || trip_id === undefined
    ? `user:${user_id}:general`
    : `user:${user_id}:trip:${trip_id}`;
}

function getChatScopeState(scope) {
  const scopeKey = getChatScopeKey(scope);

  if (!chatStateByScope.has(scopeKey)) {
    chatStateByScope.set(scopeKey, {
      history: [],
      summary: null,
      hydrated: false,
    });
  }

  return chatStateByScope.get(scopeKey);
}

export async function hydrateHistory(scope) {
  const state = getChatScopeState(scope);

  if (state.hydrated) {
    return state;
  }

  const persistedHistory = await getChatHistory(scope);
  state.history.length = 0;
  state.history.push(...persistedHistory);
  state.summary = null;
  state.hydrated = true;

  return state;
}

export function getHistory(scope) {
  return getChatScopeState(scope).history;
}

export function getSummary(scope) {
  return getChatScopeState(scope).summary;
}

export function clearHistory(scope) {
  chatStateByScope.set(getChatScopeKey(scope), {
    history: [],
    summary: null,
    hydrated: true,
  });
}

export async function limitHistoryWithSummary(scope) {
  const state = getChatScopeState(scope);

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
