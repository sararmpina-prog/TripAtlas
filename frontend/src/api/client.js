export const API_URL = 'http://localhost:3000/api';

export function createJsonHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// FUNÇÂO PARA CONSTRUIR ERROS DE API (DE FORMA PADRÃO, INCLUINDO INTERCEPTAÇÃO DE SESSÃO EXPIRADA)
export function buildApiError(data, fallbackMessage, status) {
  const backendCode = data?.code || data?.error?.code;
  let backendMessage = data?.message || data?.error?.message;
  const backendDetails = data?.details || data?.error?.details;

  // Limpa os termos técnicos nas mensagens
  if (backendMessage) {
    backendMessage = backendMessage
      .replace(/end_date/g, 'end date')
      .replace(/start_date/g, 'start date')
      .replace(/user_id/g, 'user');
  }

  // Interceção de Sessão Expirada (HTTP 401)
  if (status === 401 || backendCode === 'UNAUTHORIZED' || backendCode === 'INVALID_TOKEN') {
    // Limpa o localStorage de forma limpa para não deixar lixo na memória
    localStorage.removeItem('token'); // Substitua pela sua função de limpeza se usar outra chave
    localStorage.removeItem('user');

    // Força o navegador a ir para a página de login imediatamente;
    // Como não estamos dentro de um componente React para usar o useNavigate(), usamos o objeto nativo do browser window.location para um redirecionamento seguro.
    window.location.href = '/login';
    
    return new Error('Your session has expired. Redirecting to login...');
  }

  const message = status >= 500 || backendCode === 'INTERNAL_SERVER_ERROR'
    ? 'Something went wrong. Please try again later.'
    : (backendMessage || fallbackMessage);

  const error = new Error(message);
  error.code = backendCode;
  error.details = Array.isArray(backendDetails) ? backendDetails : [];
  error.status = status;
  return error;
}



// FUNÇÂO PARA GET DE RECURSOS PROTEGIDOS DA API (COM TRATAMENTO DE ERROS PADRÃO)
export async function fetchProtectedResource(path, token, fallbackMessage) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: createJsonHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(data, fallbackMessage, response.status);
  }
  return data;
}