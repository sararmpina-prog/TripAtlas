import { API_URL, createJsonHeaders, buildApiError, fetchProtectedResource } from './client';

export function getTrips(token) {
  return fetchProtectedResource('/trips', token, 'Unable to load trips.');
}

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

export async function updateTrip(tripId, tripData, token) {
  const response = await fetch(`${API_URL}/trips/${tripId}`, {
    method: "PATCH", // Rota PATCH integrada para o Zod updateTripSchema
    headers: createJsonHeaders(token),
    body: JSON.stringify(tripData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Failed to update trip.", response.status);
  return data;
}
