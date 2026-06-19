import { API_URL, createJsonHeaders, buildApiError } from './client';


// Carrega o histórico de conversas do utilizador.
// @param {number|null} tripId - O ID da viagem ativa, ou null para perguntas genéricas.
// @param {string} token - O token de autenticação JWT.

export async function getChatHistory(tripId, token) {
  // Se houver um tripId, adiciona-o como query string (ex: /chat?tripId=5)
  // Caso contrário, a rota chama apenas /chat (o backend saberá que é nulo)
  const queryString = tripId ? `?tripId=${tripId}` : '';

  const response = await fetch(`${API_URL}/chat${queryString}`, {
    method: "GET",
    headers: createJsonHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(data, "Unable to load conversation history.", response.status);
  }

  return data;
}

// Envia uma mensagem do utilizador para a IA e guarda no histórico.
// @param {object} chatPayload - Contém { user_id, trip_id, user_message }
// @param {string} token - O token de autenticação JWT.

export async function sendChatMessage(chatPayload, token) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: createJsonHeaders(token),
    body: JSON.stringify(chatPayload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(data, "Failed to send message to AI.", response.status);
  }

  return data;
}
