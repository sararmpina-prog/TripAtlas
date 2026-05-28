/* Funções pequenas e reutilizáveis para validações transversais.

Estas funções não lançam erros nem conhecem regras de domínio.
Limitam-se a devolver true/false para serem reutilizadas noutros validators.
*/

export function isText(value) {
  return typeof value === 'string';
}

export function isBlank(value) {
  return !isText(value) || value.trim() === '';
}

export function hasMinLength(value, min) {
  return isText(value) && value.trim().length >= min;
}

export function isIsoDate(value) {
  return isText(value)
    && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isNumericId(value) {
  return /^\d+$/.test(String(value));
}

/* Este ficheiro pretende responder à pergunta:

"isto é válido?"

E retorna:
- boolean

Nunca:
- lança erro
- transforma */