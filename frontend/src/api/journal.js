import { fetchProtectedResource, API_URL, createJsonHeaders, buildApiError } from './client';


export function getSuggestions(tripReference, token) {
  console.log("estou no get sugestions")  
  console.log("get suggestions e nome é", tripReference)
  return fetchProtectedResource(
    `/suggestions?trip_reference=${encodeURIComponent(tripReference)}`,
    token,
    'Unable to load suggestions.'
  );
}


export async function deleteSuggestion(suggestionId, token) {
  const response = await fetch(`${API_URL}/suggestions/${suggestionId}`, {
    method: "DELETE",
    headers: createJsonHeaders(token)
  });

  const data = await response.json();

  if (!response.ok) throw buildApiError(data, "Failed to delete suggestion.", response.status);

  return data;
}