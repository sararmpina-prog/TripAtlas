import { ValidationError } from '../utils/appErrors.js';

import {
  parseRequiredText,
  parseIsoDatetime,
  parseNumericId
} from './fieldParsers.js';

import {
  normalizeOptionalText
} from './inputNormalizers.js';

const flightFields = {
  tripId: value => parseNumericId(value, 'tripId'),
  flightNumber: normalizeOptionalText,
  airline: normalizeOptionalText,
  departureAirport: normalizeOptionalText,
  arrivalAirport: normalizeOptionalText,
  departureDatetime: value =>
    parseIsoDatetime(value, 'departureDatetime'),
  arrivalDatetime: value =>
    parseIsoDatetime(value, 'arrivalDatetime')
};

function buildValidatedFlight(
  payload = {},
  { requireAtLeastOneField = false } = {}
) {
  const flight = {};

  for (const [field, parser] of Object.entries(flightFields)) {
    const value = payload[field];

    const shouldParse =
      value !== undefined || !requireAtLeastOneField;

    if (shouldParse) {
      const parsedValue = parser(value);

      if (parsedValue !== undefined) {
        flight[field] = parsedValue;
      }
    }
  }

  if (
    flight.departureDatetime &&
    flight.arrivalDatetime &&
    flight.arrivalDatetime < flight.departureDatetime // validação cross-field
    ) {
    throw new ValidationError(
        'Arrival datetime cannot be earlier than departure datetime.'
    );
  }

  if (
    requireAtLeastOneField &&
    Object.keys(flight).length === 0
  ) {
    throw new ValidationError(
      'Please indicate at least one field to update.'
    );
  }

  return flight;
}

export function validateCreateFlight(payload) {
  return buildValidatedFlight(payload);
}

export function validateUpdateFlight(payload) {
  return buildValidatedFlight(payload, {
    requireAtLeastOneField: true
  });
}

/* Este ficheiro pretende responder à pergunta:

"quais são as regras do Flight?"

Responsável por:
- regras da entidade
- mensagens de erro
- coerência entre campos */