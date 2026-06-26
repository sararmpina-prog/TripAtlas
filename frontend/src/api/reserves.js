<<<<<<< HEAD
import { fetchProtectedResource } from './client';

=======
import { API_URL, createJsonHeaders, buildApiError, fetchProtectedResource } from './client';

// Procura todos os reservas de acomodação associados ao utilizador.
>>>>>>> frontend-limpo
export function getReserves(token) {
  return fetchProtectedResource('/reserves', token, 'Unable to load accommodation reserves.');
}

<<<<<<< HEAD
export async function createReserves(reserveData, token) {
=======
// Cria um novo registo de reserva de acomodação na Base de Dados.
export async function createReserve(reserveData, token) {
>>>>>>> frontend-limpo
  const response = await fetch(`${API_URL}/reserves`, {
    method: "POST",
    headers: createJsonHeaders(token),
    body: JSON.stringify(reserveData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to create accommodation reserve.", response.status);
  return data;
}

<<<<<<< HEAD
export async function updateReserve(reserveId, reserveData, token) {
  const response = await fetch(`${API_URL}/reserves/${reserveId}`, {
    method: "PATCH", // Rota PATCH integrada para o Zod updateReserveSchema
=======
// Atualiza os dados de uma reserva de acomodação existente (PATCH)
export async function updateReserve(reserveId, reserveData, token) {
  const response = await fetch(`${API_URL}/reserves/${reserveId}`, {
    method: "PATCH", // Rota PATCH integrada updateReserveSchema do Zod
>>>>>>> frontend-limpo
    headers: createJsonHeaders(token),
    body: JSON.stringify(reserveData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to update accommodation reserve.", response.status);
  return data;
}
<<<<<<< HEAD
=======

// Apaga uma reserva de acomodação existente (DELETE)
export async function deleteReserve(reserveId, token) {
  const response = await fetch(`${API_URL}/reserves/${reserveId}`, {
    method: "DELETE",
    headers: createJsonHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to delete accommodation reserve.", response.status);
  return data;
}

>>>>>>> frontend-limpo
