// src/api/users.js
import { API_URL, createJsonHeaders, buildApiError } from './client';

/* Atualiza os dados de perfil do utilizador (first_name, surname, email, mobile_phone) */

export async function updateUserProfile(userId, payload, token) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "PATCH",
    headers: createJsonHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw buildApiError(data, "Failed to update profile.", response.status);
  }
  return data;
}

/* Atualiza de forma segura a password do utilizador (Exclusivo para a rota separada) */
export async function updateUserPassword(userId, payload, token) {
  const response = await fetch(`${API_URL}/users/${userId}/password`, {
    method: "PATCH",
    headers: createJsonHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(data, "Failed to update password.", response.status);
  }
  return data;
}
