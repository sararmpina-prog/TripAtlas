/* Helpers reutilizáveis para composição de validação.

Estas funções coordenam:
- obrigatoriedade
- opcionalidade
- nullability
- arrays
- ranges

Podem lançar ValidationError mas não conhecem entidades de domínio.
*/

import { ValidationError } from "../utils/appErrors.js";

export function optional(value, parser) {
  return value === undefined
    ? undefined
    : parser(value);
}

export function nullable(value, parser) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return parser(value);
}

export function arrayOf(value, itemValidator) {
  if (!Array.isArray(value)) {
    throw new ValidationError('Value must be an array.');
  }

  return value.map(itemValidator);
}

export function range(value, min, max) {
  if (typeof value !== 'number' || value < min || value > max) {
    throw new ValidationError(
        `Value must be between ${min} and ${max}.`
    );
  }

  return value;
}

/* Este ficheiro pretende responder à pergunta:

"como componho validação reutilizável?"

Responsável por:
- optional
- nullable
- arrays
- ranges */
