/* Helpers de validação técnica */

import { ValidationError } from '../utils/appErrors.js';

import {
  isBlank,
  isIsoDate,
  isNumericId,
  hasMinLength
} from './inputValidators.js';

import {
  normalizeText,
  toNumber
} from './inputNormalizers.js';

function requireValue(value, fieldName) {
  if (isBlank(value)) {
    throw new ValidationError(
      `The field ${fieldName} is mandatory.`
    );
  }

  return normalizeText(value);
}

export function parseRequiredText(
  value,
  fieldName,
  minLength = 1
) {
  const normalized = requireValue(value, fieldName);

  if (!hasMinLength(normalized, minLength)) {
    throw new ValidationError(
      `The field ${fieldName} is too short.`
    );
  }

  return normalized;
}

export function parseIsoDate(value, fieldName) {
  const normalized = requireValue(value, fieldName);

  if (!isIsoDate(normalized)) {
    throw new ValidationError(
      `The field ${fieldName} must use YYYY-MM-DD.`
    );
  }

  return normalized;
}

export function parseNumericId(value, fieldName) {
  const normalized = requireValue(value, fieldName);

  if (!isNumericId(normalized)) {
    throw new ValidationError(
      `The field ${fieldName} must be numeric.`
    );
  }

  return toNumber(normalized);
}
/* Convertem e validam formato:
- recebem input
- validam
- transformam
- devolvem valor final ou lançam ValidationError.

Nunca:
- conhecem regras de negócio
- lançam erros de domínio */

