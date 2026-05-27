/* Helpers pequenos e reutilizáveis para validações transversais.

Estas funções não lançam erros nem conhecem regras de domínio.
Limitam-se a devolver true/false para serem reutilizadas noutros validators.
*/

export function isBlank(value) {
  return typeof value === 'string' && value.trim() === '';
}

export function isMinLength(value, min) {
  if (typeof value !== 'string') {
    return false;
  }

  return value.trim().length >= min;
}