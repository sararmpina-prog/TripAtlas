import { API_URL, createJsonHeaders, buildApiError, fetchProtectedResource } from './client';

<<<<<<< HEAD
=======
// Procura todos os voos associados ao utilizador.
>>>>>>> frontend-limpo
export function getTrips(token) {
  return fetchProtectedResource('/trips', token, 'Unable to load trips.');
}

<<<<<<< HEAD
=======
// Cria um novo registo de viagem na Base de Dados.
>>>>>>> frontend-limpo
export async function createTrip(tripData, token) {
  const response = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: createJsonHeaders(token),
    body: JSON.stringify(tripData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to create trip.", response.status);
  return data;
}

<<<<<<< HEAD
export async function updateTrip(tripId, tripData, token) {
  const response = await fetch(`${API_URL}/trips/${tripId}`, {
    method: "PATCH", // Rota PATCH integrada para o Zod updateTripSchema
=======
// Atualiza os dados de uma viagem existente (PATCH)
export async function updateTrip(tripId, tripData, token) {
  const response = await fetch(`${API_URL}/trips/${tripId}`, {
    method: "PATCH", // Rota PATCH integrada para updateTripSchema do Zod
>>>>>>> frontend-limpo
    headers: createJsonHeaders(token),
    body: JSON.stringify(tripData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to update trip.", response.status);
  return data;
}
<<<<<<< HEAD
=======

// Apaga uma viagem existente (DELETE)
export async function deleteTrip(tripId, token) {
  const response = await fetch(`${API_URL}/trips/${tripId}`, {
    method: "DELETE",
    headers: createJsonHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to delete trip.", response.status);
  return data;
}
>>>>>>> frontend-limpo
