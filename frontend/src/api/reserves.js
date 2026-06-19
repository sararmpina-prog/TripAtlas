import { fetchProtectedResource } from './client';

export function getReserves(token) {
  return fetchProtectedResource('/reserves', token, 'Unable to load accommodation reserves.');
}

export async function createReserves(reserveData, token) {
  const response = await fetch(`${API_URL}/reserves`, {
    method: "POST",
    headers: createJsonHeaders(token),
    body: JSON.stringify(reserveData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to create accommodation reserve.", response.status);
  return data;
}

export async function updateReserve(reserveId, reserveData, token) {
  const response = await fetch(`${API_URL}/reserves/${reserveId}`, {
    method: "PATCH", // Rota PATCH integrada para o Zod updateReserveSchema
    headers: createJsonHeaders(token),
    body: JSON.stringify(reserveData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to update accommodation reserve.", response.status);
  return data;
}
