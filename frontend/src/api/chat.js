import { API_URL, createJsonHeaders, buildApiError } from './client';


// Carrega o histórico de conversas do utilizador.
// @param {number|null} tripId - O ID da viagem ativa, ou null para perguntas genéricas.
// @param {string} token - O token de autenticação JWT.

export async function getChatHistory(chatId, token) {
  // Se houver um tripId, adiciona-o como query string (ex: /chat?tripId=5)
  // Caso contrário, a rota chama apenas /chat (o backend saberá que é nulo)
  // const queryString = chatId ? `?chatId=${chatId}` : '';

  // console.log("estou no get history")
  // console.log("queryString é", queryString)

  // console.log(`${API_URL}/ai/chat/${queryString}`)

  const response = await fetch(`${API_URL}/ai/chat/${chatId}`, {
    method: "GET",
    headers: createJsonHeaders(token),
  });

  const data = await response.json();
  console.log("Data no meu get é", data)

  if (!response.ok) {
    throw buildApiError(data, "Unable to load conversation history.", response.status);
  }

  return data.data;
}

// Envia uma mensagem do utilizador para a IA e guarda no histórico.
// @param {object} chatPayload - Contém { user_id, trip_id, user_message }
// @param {string} token - O token de autenticação JWT.

export async function sendChatMessage(chatPayload, token) {
  console.log("estou no POST send message bot")
  const response = await fetch(`${API_URL}/ai/chat`, {
    method: "POST",
    headers: createJsonHeaders(token),
    body: JSON.stringify(chatPayload),
  });

  const data = await response.json();
  console.log("data no POST é", data)

  if (!response.ok) {
    throw buildApiError(data, "Failed to send message to AI.", response.status);
  }

  return data;
}



export async function getChatSessions(token) {
  const response = await fetch(`${API_URL}/ai/chats`, {
    method: "GET",
    headers: createJsonHeaders(token),
  });

  const data = await response.json();
  console.log("tou no fetch certo", data)

  if (!response.ok) {
    throw buildApiError(data, "Unable to load chat sessions.", response.status);
  }

  return data.data; // array de chats
}