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
  console.log(JSON.stringify(response, null, 2));

  if (!response.ok) {
    throw new Error(
      "Login failed"
    );
  }

  return data;
}

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Register failed");
  }

  return data;
}