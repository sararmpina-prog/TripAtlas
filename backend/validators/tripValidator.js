import { ValidationError } from '../utils/appErrors.js';

import {
  parseRequiredText,
  parseIsoDate,
  parseNumericId
} from './fieldParsers.js';

import {
  normalizeOptionalText
} from './inputNormalizers.js';

const tripFields = {
  title: value => parseRequiredText(value, 'title'),
  description: normalizeOptionalText,
  destination: value => parseRequiredText(value, 'destination'),
  startDate: value => parseIsoDate(value, 'startDate'),
  endDate: value => parseIsoDate(value, 'endDate'),
  userId: value => parseNumericId(value, 'userId')
};

function buildValidatedTrip(
  payload = {},
  { requireAtLeastOneField = false } = {}
) {
  const trip = {};

  for (const [field, parser] of Object.entries(tripFields)) {
    const value = payload[field];

    const shouldParse =
      value !== undefined || !requireAtLeastOneField;

    if (shouldParse) {
      trip[field] = parser(value);
    }
  }

  if (
    trip.startDate && 
    trip.endDate &&
    trip.endDate < trip.startDate // validação cross-field
  ) {
    throw new ValidationError(
      'The end date cannot be earlier than the start date.'
    );
  }

  if (
    requireAtLeastOneField &&
    Object.keys(trip).length === 0
  ) {
    throw new ValidationError(
      'Please indicate at least one field to update.'
    );
  }

  return trip;
}

export function validateCreateTrip(payload) {
  return buildValidatedTrip(payload);
}

export function validateUpdateTrip(payload) {
  return buildValidatedTrip(payload, {
    requireAtLeastOneField: true
  });
}

/* Este ficheiro pretende responder à pergunta:

"quais são as regras da Trip?"

Responsável por:
- regras da entidade
- mensagens de erro
- coerência entre campos */