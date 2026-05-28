import { ValidationError } from '../utils/appErrors.js';

import {
  parseRequiredText,
  parseIsoDate,
  parseNumericId
} from './fieldParsers.js';

import {
  normalizeOptionalText
} from './inputNormalizers.js';

function buildValidatedTrip(
  payload = {},
  { requireAtLeastOneField = false } = {}
) {
  const trip = {};

  if (payload.title !== undefined || !requireAtLeastOneField) {
    trip.title =
      payload.title === undefined
        ? null
        : parseRequiredText(payload.title, 'title');
  }

  if (payload.description !== undefined || !requireAtLeastOneField) {
    trip.description = normalizeOptionalText(payload.description);
  }

  if (payload.destination !== undefined || !requireAtLeastOneField) {
    trip.destination = parseRequiredText(
      payload.destination,
      'destination'
    );
  }

  if (payload.startDate !== undefined || !requireAtLeastOneField) {
    trip.startDate = parseIsoDate(
      payload.startDate,
      'startDate'
    );
  }

  if (payload.endDate !== undefined || !requireAtLeastOneField) {
    trip.endDate = parseIsoDate(
      payload.endDate,
      'endDate'
    );
  }

  if (payload.userId !== undefined || !requireAtLeastOneField) {
    trip.userId = parseNumericId(
      payload.userId,
      'userId'
    );
  }

  if (
    trip.startDate
    && trip.endDate
    && trip.endDate < trip.startDate
  ) {
    throw new ValidationError(
      'A data de fim não pode ser anterior à data de início.'
    );
  }

  if (
    requireAtLeastOneField
    && Object.keys(trip).length === 0
  ) {
    throw new ValidationError(
      'Indica pelo menos um campo para atualizar.'
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