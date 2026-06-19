import { API_URL, createJsonHeaders, buildApiError } from './client';

export async function loginUser(credentials) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: createJsonHeaders(),
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Login failed", response.status);
  return data;
}

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: createJsonHeaders(),
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) throw buildApiError(data, "Register failed", response.status);
  return data;
}
