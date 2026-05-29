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
  if (
    !isText(value)
    || !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [year, month, day] = value
    .split('-')
    .map(Number);

  const date = new Date(value);

  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() + 1 === month
    && date.getUTCDate() === day
  );
}

export function isIsoDatetime(value) {
  if (
    !isText(value)
    || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
  ) {
    return false;
  }

  const [datePart, timePart] = value.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() + 1 === month
    && date.getUTCDate() === day
    && date.getUTCHours() === hours
    && date.getUTCMinutes() === minutes
    && date.getUTCSeconds() === seconds
  );
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