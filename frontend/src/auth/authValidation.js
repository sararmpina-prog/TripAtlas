const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s]+$/;
const backendFieldPattern = /^The field ([a-z_]+)\b/i;
const namePattern = /^[A-Za-zÀ-ÿ\s'-]+$/;

function buildErrorBag() {
  return {};
}

function joinReadableList(items) {
  if (items.length <= 1) {
    return items[0] ?? '';
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

function normalizeMessage(message) {
  return typeof message === 'string' ? message.trim() : '';
}

function appendFieldError(fieldErrors, fieldName, message) {
  if (!message) {
    return;
  }

  fieldErrors[fieldName] = fieldErrors[fieldName]
    ? `${fieldErrors[fieldName]} ${message}`
    : message;
}

function mapServerDetails(error, allowedFields) {
  const details = Array.isArray(error?.details) ? error.details : [];

  if (!details.length) {
    return null;
  }

  const fieldErrors = buildErrorBag();
  const formMessages = [];

  details.forEach((detail) => {
    const message = normalizeMessage(detail?.message);
    const fieldName = typeof detail?.field === 'string' ? detail.field : null;

    if (!message) {
      return;
    }

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

function parseBackendField(message, allowedFields) {
  const match = message.match(backendFieldPattern);

  if (!match) {
    return null;
  }

  const fieldName = match[1];
  return allowedFields.includes(fieldName) ? fieldName : null;
}

function mapServerError(error, allowedFields, fallbackMessage) {
  const message = normalizeMessage(error?.message) || fallbackMessage;
  const detailedState = mapServerDetails(error, allowedFields);

  if (detailedState && (Object.keys(detailedState.fieldErrors).length > 0 || detailedState.formError)) {
    return detailedState;
  }

  const fieldErrors = buildErrorBag();

  const fieldFromBackend = parseBackendField(message, allowedFields);
  if (fieldFromBackend) {
    fieldErrors[fieldFromBackend] = message;
    return { fieldErrors, formError: '' };
  }

  if (message === 'This email address is already registered.' && allowedFields.includes('email')) {
    fieldErrors.email = message;
    return { fieldErrors, formError: '' };
  }

  if (message === 'This mobile phone number is already registered.' && allowedFields.includes('mobile_phone')) {
    fieldErrors.mobile_phone = message;
    return { fieldErrors, formError: '' };
  }

  return { fieldErrors, formError: message };
}

function validateNameField(value, fieldName, label, errors) {
  const normalizedValue = value?.trim() ?? '';

  if (!normalizedValue) {
    errors[fieldName] = `${label} is required.`;
    return;
  }

  if (normalizedValue.length < 2) {
    errors[fieldName] = `${label} must have at least 2 letters.`;
    return;
  }

  if (!namePattern.test(normalizedValue)) {
    errors[fieldName] = `${label} can only contain letters.`;
  }
}

function getPasswordValidationMessage(password) {
  const normalizedPassword = password ?? '';

  if (!normalizedPassword) {
    return 'Password is required.';
  }

  const requirements = [];

  if (normalizedPassword.length < 6) {
    requirements.push('at least 6 characters');
  }

  if (!/[A-Z]/.test(normalizedPassword)) {
    requirements.push('one uppercase letter');
  }

  if (!/[a-z]/.test(normalizedPassword)) {
    requirements.push('one lowercase letter');
  }

  if (!/[0-9]/.test(normalizedPassword)) {
    requirements.push('one number');
  }

  if (!/[^A-Za-z0-9]/.test(normalizedPassword)) {
    requirements.push('one special character');
  }

  if (!requirements.length) {
    return '';
  }

  return `Password must include ${joinReadableList(requirements)}.`;
}

export function validateRegisterForm(formData) {
  const errors = buildErrorBag();

  validateNameField(formData.first_name, 'first_name', 'First name', errors);
  validateNameField(formData.surname, 'surname', 'Surname', errors);

  if (!emailPattern.test(formData.email?.trim() ?? '')) {
    errors.email = 'Please enter a valid email address.';
  }

  if (formData.mobile_phone?.trim()) {
    const mobilePhone = formData.mobile_phone.trim();
    const digitsOnly = mobilePhone.replace(/\D/g, '');

    if (!phonePattern.test(mobilePhone) || digitsOnly.length < 9 || mobilePhone.length > 20) {
      errors.mobile_phone = 'Please enter a valid phone number.';
    }
  }

  const passwordError = getPasswordValidationMessage(formData.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}

export function normalizeRegisterPayload(formData) {
  const normalizedPayload = {
    first_name: formData.first_name.trim(),
    surname: formData.surname.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
  };

  const mobilePhone = formData.mobile_phone.trim();
  if (mobilePhone) {
    normalizedPayload.mobile_phone = mobilePhone;
  }

  return normalizedPayload;
}

export function validateLoginForm(formData) {
  const errors = buildErrorBag();

  if (!emailPattern.test(formData.email?.trim() ?? '')) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!(formData.password ?? '').trim()) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export function normalizeLoginPayload(formData) {
  return {
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
  };
}

export function hasValidationErrors(fieldErrors) {
  return Object.keys(fieldErrors).length > 0;
}

export function getRegisterErrorState(error) {
  return mapServerError(
    error,
    ['first_name', 'surname', 'email', 'mobile_phone', 'password'],
    'Register failed.'
  );
}

export function getLoginErrorState(error) {
  return mapServerError(
    error,
    ['email', 'password'],
    'Login failed.'
  );
}