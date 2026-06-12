// src/api.js 
export const API_URL = 'http://localhost:3000/api'


// Autenticar utilizador (POST)
export async function loginUser(credentials) {
  console.log("Estou no fetch, e a informação recebida é", credentials)
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  console.log("data após o fetch é", data)

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      "Login failed"
    );
  }

  return data;
}