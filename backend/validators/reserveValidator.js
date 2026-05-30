
//Transforma qualquer params.id em string primeiro, teste regex (só números). test (devolve booleano)
export function validateReserveId(value) {
  if (!/^\d+$/.test(String(value))) {
    throw new ValidationError('É necessário indicar um id válido para a trip.');
  }

  return Number(value);
}

function requireText(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`O campo ${fieldName} é obrigatório.`);
  }

  return value.trim();
}

function normalizeIsoDate(value, fieldName) {
  const normalizedValue = requireText(value, fieldName);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    throw new ValidationError(`O campo ${fieldName} deve usar o formato YYYY-MM-DD.`);
  }

  return normalizedValue;
}

function buildValidatedReserve(payload) {
  console.log("O meu payload é", payload)
  const reserve = {};

  if (payload.check_in_date) {
    reserve.check_in_date = normalizeIsoDate(payload.check_in_date, 'check_in_date');
  }

  if (payload.check_out_date) {
    reserve.check_out_date = normalizeIsoDate(payload.check_out_date, 'check_out_date');
  }

  if (reserve.check_in_date && reserve.check_out_date && reserve.check_out_date < reserve.check_in_date) {
    throw new ValidationError('A data de fim não pode ser anterior à data de início.');
  }

  if (Object.keys(reserve).length === 0) {
    throw new ValidationError('Indica pelo menos um campo para atualizar.');
  }

  console.log("A minha reserva é", reserve)
  return reserve;
}

export function validateCreateReserve(payload) {
  return buildValidatedReserve(payload);
}
