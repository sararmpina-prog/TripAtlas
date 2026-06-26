const backendFieldPattern = /^The field ([a-z_]+)\b/i;

export function normalizeMessage(message) {
  return typeof message === 'string' ? message.trim() : '';
}

export function appendFieldError(fieldErrors, fieldName, message) {
  if (!message) return;
  fieldErrors[fieldName] = fieldErrors[fieldName]
    ? `${fieldErrors[fieldName]} ${message}`
    : message;
}

export function mapServerDetails(error, allowedFields) {
  const details = Array.isArray(error?.details) ? error.details : [];
  if (!details.length) return null;

  const fieldErrors = {};
  const formMessages = [];

  details.forEach((detail) => {
    const message = normalizeMessage(detail?.message);
    const fieldName = typeof detail?.field === 'string' ? detail.field : null;

    if (!message) return;

    if (fieldName && allowedFields.includes(fieldName)) {
      appendFieldError(fieldErrors, fieldName, message);
      return;
    }
    formMessages.push(message);
  });

  return {
    fieldErrors,
    formError: formMessages.join(' '),
  };
}

export function parseBackendField(message, allowedFields) {
  const match = message.match(backendFieldPattern);
  if (!match) return null;
  return allowedFields.includes(match[1]) ? match[1] : null;
}

// FUNÇÃO GLOBAL E GENÉRICA (Usada em Auth, flights, trips, accommodations)
export function mapApiServerError(error, allowedFields, fallbackMessage) {
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
