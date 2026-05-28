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
      `O campo ${fieldName} é obrigatório.`
    );
  }

  return normalizeText(value);
}

export function parseIsoDate(value, fieldName) {
  if (isBlank(value)) {
    throw new ValidationError(
      `O campo ${fieldName} é obrigatório.`
    );
  }

  const normalized = normalizeText(value);

  if (!isIsoDate(normalized)) {
    throw new ValidationError(
      `O campo ${fieldName} deve usar YYYY-MM-DD.`
    );
  }

  return normalized;
}

export function parseNumericId(value, fieldName) {
  if (isBlank(value)) {
    throw new ValidationError(
      `O campo ${fieldName} é obrigatório.`
    );
  }

  const normalized = normalizeText(value);

  if (!isNumericId(normalized)) {
    throw new ValidationError(
      `O campo ${fieldName} deve ser numérico.`
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

