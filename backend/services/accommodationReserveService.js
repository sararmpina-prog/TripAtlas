import * as reserveRepository from '../repository/reserveRepository.js';
import * as tripRepository from '../repository/tripRepository.js';
import * as accommodationRepository from '../repository/accommodationRepository.js';
import { NotFoundError, ValidationError} from '../utils/appErrors.js';

// Transforma o snake_case da BD para camelCase consistente no Frontend
function normalizeReserve(row) {
  return {
    id: row.id,
    accommodationId: row.accommodation_id,
    tripId: row.trip_id,
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date

    /* SUGESTÃO: acrescentar:

    createdAt: row.created_at,
    updatedAt: row.updated_at
    */
  };
}

export async function listAccommodationsReserves() {
  const reserves = await reserveRepository.listReserves();

  return reserves.map(normalizeReserve)
}


export async function deleteAccommodationReserve(id) {

  /* SUGESTÃO: apagar; porque o zod já valida o formato do ID e o middleware validateIdParam já bloqueia IDs inválidos antes de chegarem aqui. Se o ID for inválido, nem sequer entramos nesta função, pelo que não precisamos de validar manualmente aqui.

  const reserveId = validateReserveId(id);
  */

  /* SUGESTÃO: !reserveRows || reserveRows.length === 0) 
  
  O motor do MySQL devolve sempre um Array (uma lista) quando fazemos db.execute(), mesmo que a query use LIMIT 1 ou procure por um ID único.
  
  O que acontece se a reserva NÃO existir? O MySQL não devolve null ou undefined. Ele devolve um array vazio: [].
  O problema em JavaScript: No JavaScript, um array vazio [] é avaliado como verdadeiro (true). Por isso, a condição if (!reserve) que tinhas escrito vai falhar sempre, porque o Node acha que a lista vazia é um registo válido. O código avançaria e tentava ler propriedades de onde não existem, mandando o servidor abaixo.Ao mudarmos para if (!reserveRows || reserveRows.length === 0), estamos a perguntar diretamente ao Node: 'A lista veio vazia?'. Se a lista tiver zero elementos, lançamos o NotFoundError com total segurança, protegendo a aplicação contra crashes.

  const reserve = await reserveRepository.findReserveById(id)

  if (!reserve) {
    throw new NotFoundError('Reserva não encontrada para apagar.');
  }
*/

  const reserveRows = await reserveRepository.findReserveById(id);

  if (!reserveRows || reserveRows.length === 0) {
    throw new NotFoundError('Reserva não encontrada para apagar.');
  }

  await reserveRepository.deleteReserve(id);
  
  return normalizeReserve(reserveRows[0]);
}

//Cria reserva
export async function createReserve(payload) {

  console.log("Estou no serviço")

  const reserve = payload

  console.log("A reserva é, após validações da data", reserve)
  
  const accommodation = await accommodationRepository.findAccommodationById(reserve.accommodation_id)
      
  if (!accommodation) {
    throw new NotFoundError('Accommodation not found.');
  }

  console.log("Id da acomodação", reserve.accommodation_id)

  let tripId = validateTripId(reserve.trip_id);

  const trip = await tripRepository.findTripById(reserve.trip_id)
    
  if (!trip) {
    throw new NotFoundError('Viagem não encontrada para criar reserva de estadia.');
  }
  
  console.log("Id da viagem", trip)

  console.log("os meus valores a inserir são", reserve)

  const duplicatedReserve = await reserveRepository.listDuplicatedReserves(reserve)

 if (duplicatedReserve) {
    throw new ValidationError('Esta reserva já existe.');
  }

 let newReserve = await reserveRepository.createReserve(reserve)

 let createdReserve = await reserveRepository.findReserveById(newReserve)

  return normalizeReserve(createdReserve)
}

// ATUALIZA UMA RESERVA EXISTENTE (PUT OU PATCH)
// Os dados de formato chegam validados, mas tratamos a regra cronológica de negócio aqui
export async function updateReserve(id, validatedReserve) {

  //Se reversa existe 
  console.log("Service patch reserva id", id)
  const existingReserve = await reserveRepository.findReserveById(id);

  if (!existingReserve) {
    throw new NotFoundError('Reserve not found.');
  }

  const updateData = {};

  // Se acomodação existe
  if (validatedReserve.accommodation_id !== undefined) {

    const accommodation = await accommodationRepository
      .findAccommodationById(validatedReserve.accommodationId);

    if (!accommodation) {
      throw new NotFoundError('Accommodation not found.');
    }
  }
  updateData.accommodation_id = validatedReserve.accommodation_id;

  // Validar trip caso seja alterada
  if (validatedReserve.trip_id !== undefined) {

    const trip = await tripRepository
      .findTripById(validatedReserve.trip_id);

    if (!trip) {
      throw new NotFoundError('Trip not found.');
    }
  }
  updateData.trip_id = validatedReserve.trip_id;

  // Validar datas usando o estado atual da BD
  if (
    validatedReserve.check_in_date !== undefined ||
    validatedReserve.check_out_date !== undefined
  ) {

    const checkInDate = validatedReserve.check_in_date
      ? (validatedReserve.check_in_date)
      : (existingReserve.check_in_date);

    const checkOutDate = validatedReserve.check_out_date
      ? (validatedReserve.check_out_date)
      : (existingReserve.check_out_date);

    if (checkOutDate < checkInDate) {
      throw new ValidationError(
        'The check_out_date cannot be earlier than the check_in_date.'
      );
    }
    updateData.check_in_date = checkInDate
    updateData.check_out_date = checkOutDate;
  }


  console.log("serviço validatedReserve", updateData)

  await reserveRepository.updateReserve(id, updateData);

  const updatedReserve = await reserveRepository.findReserveById(id);

  return normalizeReserve(updatedReserve);

}