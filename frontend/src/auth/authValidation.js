const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s]+$/;
const backendFieldPattern = /^The field ([a-z_]+)\b/i;

function buildErrorBag() {
  return {};
}

function normalizeMessage(message) {
  return typeof message === 'string' ? message.trim() : '';
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

  return { fieldErrors, formError: message };
}

export function validateRegisterForm(formData) {
  const errors = buildErrorBag();

  if (!formData.first_name?.trim()) {
    errors.first_name = 'First name is required.';
  }

  if (!formData.surname?.trim()) {
    errors.surname = 'Surname is required.';
  }

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

  if ((formData.password ?? '').length < 6) {
    errors.password = 'Password must have at least 6 characters.';
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