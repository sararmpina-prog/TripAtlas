import { fetchProtectedResource } from './client';

export function getFlights(token) {
  return fetchProtectedResource('/flights', token, 'Unable to load flights.');
}

export async function createFlights(flightData, token) {
  const response = await fetch(`${API_URL}/flights`, {
    method: "POST",
    headers: createJsonHeaders(token),
    body: JSON.stringify(flightData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to create flight.", response.status);
  return data;
}

export async function updateFlight(flightId, flightData, token) {
  const response = await fetch(`${API_URL}/flights/${flightId}`, {
    method: "PATCH", // Rota PATCH integrada para o Zod updateFlightSchema
    headers: createJsonHeaders(token),
    body: JSON.stringify(flightData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to update flight.", response.status);
  return data;
}
