export const API_URL = 'http://localhost:3000/api'

function createJsonHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function buildApiError(data, fallbackMessage, status) {
  const backendCode = data?.error?.code;
  const backendMessage = data?.error?.message;
  const backendDetails = data?.error?.details;
  const message = status >= 500 || backendCode === 'INTERNAL_SERVER_ERROR'
    ? 'Something went wrong. Please try again later.'
    : (backendMessage || fallbackMessage);

  const error = new Error(message);
  error.code = data?.error?.code;
  error.details = Array.isArray(backendDetails) ? backendDetails : []; // Array para agrupar mensagens de erro por campo, se necessário
  error.status = status;
  return error;
}


// Autenticar utilizador (POST)
export async function loginUser(credentials) {
  console.log("Estou no fetch, e a informação recebida é", credentials)
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: createJsonHeaders(),
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  console.log("data após o fetch é", data)
  console.log(JSON.stringify(response, null, 2));

  if (!response.ok) {
    throw buildApiError(data, "Login failed", response.status);
  }

  return data;
}


//Criar utilizador
export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: createJsonHeaders(),
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(data, "Register failed", response.status);
  }

  return data;
}

async function fetchProtectedResource(path, token, fallbackMessage) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: createJsonHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(data, fallbackMessage, response.status);
  }

  return data;
}

export function getTrips(token) {
  return fetchProtectedResource('/trips', token, 'Unable to load trips.');
}

export function getFlights(token) {
  return fetchProtectedResource('/flights', token, 'Unable to load flights.');
}

export function getReserves(token) {
  return fetchProtectedResource('/reserves', token, 'Unable to load accommodation reserves.');
}