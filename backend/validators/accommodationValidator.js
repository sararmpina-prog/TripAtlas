//Transforma qualquer params.id em string primeiro, teste regex (só números). test (devolve booleano)
export function validateAccommodationId(value) {
  if (!/^\d+$/.test(String(value))) {
    throw new ValidationError('É necessário indicar um id válido para a acomodação.');
  }

  return Number(value);
}
