import { fetchProtectedResource } from './client';

export function getSuggestions(tripName, token) {
  console.log("estou no get sugestions")  
  console.log("get suggestions e nome é", tripName)
  return fetchProtectedResource(
    `/suggestions?trip_name=${encodeURIComponent(tripName)}`,
    token,
    'Unable to load suggestions.'
  );
}