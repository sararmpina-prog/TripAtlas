// Herdando a mesma lógica analítica do validador de auth
const backendFieldPattern = /^The field ([a-z_]+)\b/i;

function normalizeMessage(message) {
  return typeof message === 'string' ? message.trim() : '';
}

// Mapeia os detalhes complexos enviados pela API (se houver um array de detalhes)
function mapServerDetails(error, allowedFields) {
  const details = Array.isArray(error?.details) ? error.details : [];
  if (!details.length) return null;

  const fieldErrors = {};
  const formMessages = [];

  details.forEach((detail) => {
    const message = normalizeMessage(detail?.message);
    const fieldName = typeof detail?.field === 'string' ? detail.field : null;

    if (!message) return;

    if (fieldName && allowedFields.includes(fieldName)) {
      fieldErrors[fieldName] = fieldErrors[fieldName] ? `${fieldErrors[fieldName]} ${message}` : message;
      return;
    }
    formMessages.push(message);
  });

  return { fieldErrors, formError: formMessages.join(' ') };
}

// Analisa a string se o backend enviar o erro no formato "The field flight_number..."
function parseBackendField(message, allowedFields) {
  const match = message.match(backendFieldPattern);
  if (!match) return null;
  const fieldName = match[1];
  return allowedFields.includes(fieldName) ? fieldName : null;
}

// Função usada no FlightIndex para mapear erros da API para o formulário de voo
export function mapFlightServerError(error, allowedFields, fallbackMessage) {
  const message = normalizeMessage(error?.message) || fallbackMessage;
  const detailedState = mapServerDetails(error, allowedFields);

  if (detailedState && (Object.keys(detailedState.fieldErrors).length > 0 || detailedState.formError)) {
    return detailedState;
  }

  const fieldErrors = {};
  const fieldFromBackend = parseBackendField(message, allowedFields);
  
  if (fieldFromBackend) {
    fieldErrors[fieldFromBackend] = message;
    return { fieldErrors, formError: '' };
  }

  return { fieldErrors, formError: message };
}
