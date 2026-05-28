/* Helpers pequenos e reutilizáveis para normalização de inputs.

Estas funções não conhecem regras de domínio nem lançam erros.
Limitam-se a transformar valores para formatos consistentes.
*/

export function normalizeText(value) {
  return typeof value === 'string'
    ? value.trim()
    : value;
}

export function normalizeOptionalText(value) {
  if (
    value === undefined
    || value === null
    || (typeof value === 'string' && value.trim() === '')
  ) {
    return null;
  }

  return normalizeText(value);
}

export function toNumber(value) {
  return Number(value);
}

export function toLowerCase(value) {
  return typeof value === 'string'
    ? value.toLowerCase()
    : value;
}

/* Este ficheiro pretende responder à pergunta:

"como normalizo isto?"

Retorna:
- valor transformado

Nunca:
- valida domínio
- lança ValidationError */