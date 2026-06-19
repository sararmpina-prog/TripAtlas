import { fetchProtectedResource } from './client';

export function getFlights(token) {
  return fetchProtectedResource('/flights', token, 'Unable to load flights.');
}

export function getReserves(token) {
  return fetchProtectedResource('/reserves', token, 'Unable to load accommodation reserves.');
}
