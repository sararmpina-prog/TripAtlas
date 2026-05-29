/* Helpers de validação técnica */

import { ValidationError } from '../utils/appErrors.js';

import {
  isBlank,
  isIsoDate,
  isNumericId
} from './inputValidators.js';

import {
  normalizeText,
  toNumber
} from './inputNormalizers.js';

export function parseRequiredText(value, fieldName) {
  if (isBlank(value)) {
    throw new ValidationError(
      `The field ${fieldName} is mandatory.`
    );
  }

  return normalizeText(value);
}

export function parseIsoDate(value, fieldName) {
  if (isBlank(value)) {
    throw new ValidationError(
      `The field ${fieldName} is mandatory.`
    );
  }

  const normalized = normalizeText(value);

  if (!isIsoDate(normalized)) {
    throw new ValidationError(
      `The field ${fieldName} must use YYYY-MM-DD.`
    );
  }

  return normalized;
}

export function parseNumericId(value, fieldName) {
  if (isBlank(value)) {
    throw new ValidationError(
      `The field ${fieldName} is mandatory.`
    );
  }

  const normalized = normalizeText(value);

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

