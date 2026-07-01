import { API_URL, createJsonHeaders, buildApiError, fetchProtectedResource } from './client';

export function getAccommodations(token) {
  return fetchProtectedResource('/accommodations', token, 'Unable to load accommodations.');
}

export async function createAccommodation(accommodationData, token) {
  const response = await fetch(`${API_URL}/accommodations`, {
    method: 'POST',
    headers: createJsonHeaders(token),
    body: JSON.stringify(accommodationData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, 'Failed to create accommodation.', response.status);
  return data;
}

export async function updateAccommodation(accommodationId, accommodationData, token) {
  const response = await fetch(`${API_URL}/accommodations/${accommodationId}`, {
    method: 'PATCH',
    headers: createJsonHeaders(token),
    body: JSON.stringify(accommodationData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, 'Failed to update accommodation.', response.status);
  return data;
}

export async function deleteAccommodation(accommodationId, token) {
  const response = await fetch(`${API_URL}/accommodations/${accommodationId}`, {
    method: 'DELETE',
    headers: createJsonHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, 'Failed to delete accommodation.', response.status);
  return data;
}
