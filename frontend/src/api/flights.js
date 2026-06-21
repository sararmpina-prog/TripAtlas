import { API_URL, createJsonHeaders, buildApiError, fetchProtectedResource } from './client';

// Procura todos os voos associados ao utilizador.
export function getFlights(token) {
  return fetchProtectedResource('/flights', token, 'Unable to load flights.');
}

// Cria um novo registo de voo (Ida ou Ida/Volta unificados) na Base de Dados.
export async function createFlight(flightData, token) {
  const response = await fetch(`${API_URL}/flights`, {
    method: "POST",
    headers: createJsonHeaders(token),
    body: JSON.stringify(flightData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to create flight.", response.status);
  return data;
}

// Atualiza os dados de um voo existente (PATCH)
export async function updateFlight(flightId, flightData, token) {
  const response = await fetch(`${API_URL}/flights/${flightId}`, {
    method: "PATCH", // Rota PATCH integrada para o updateFlightSchema do Zod
    headers: createJsonHeaders(token),
    body: JSON.stringify(flightData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to update flight.", response.status);
  return data;
}

// Apaga um voo existente (DELETE)
export async function deleteFlight(flightId, token) {
  const response = await fetch(`${API_URL}/flights/${flightId}`, {
    method: "DELETE",
    headers: createJsonHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to delete flight.", response.status);
  return data;
}
