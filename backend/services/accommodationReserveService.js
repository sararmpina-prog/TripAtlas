import * as reserveRepository from '../repository/reserveRepository.js';
import * as tripRepository from '../repository/tripRepository.js';
import * as accommodationRepository from '../repository/accommodationRepository.js';
import {validateReserveId} from '../validators/reserveValidator.js'
import {validateCreateReserve} from '../validators/reserveValidator.js'
import {validateAccommodationId} from '../validators/accommodationValidator.js'
import {validateTripId} from '../validators/tripValidator.js'
import { NotFoundError, ValidationError} from '../utils/appErrors.js';


// Transforma o snake_case da BD para camelCase consistente no Frontend
function normalizeReserve(row) {
  return {
    id: row.id,
    accommodationId: row.accommodation_id,
    tripId: row.trip_id,
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date
  };
}

export async function listAccommodationsReserves() {
  const reserves = await reserveRepository.listReserves();

  return reserves
}


export async function deleteAccommodationReserve(id) {

  const reserveId = validateReserveId(id);

  const reserve = await reserveRepository.findReserveById(reserveId)

  if (!reserve) {
    throw new NotFoundError('Reserva não encontrada para apagar.');
  }

   // Apaga a reserva diretamente da base de dados
  await flightRepository.deleteReserve(reserveId);

  return reserve
}


//Cria reserva
export async function createReserve(payload) {

  console.log("Estou no serviço")

  const reserve = payload;

  console.log("A reserva é, após validações da data", reserve)

  let accommodationId = validateAccommodationId(payload.accommodation_id);
  
  const accommodation = await accommodationRepository.findAccommodationById(accommodationId)
      
  if (!accommodation) {
    throw new NotFoundError('Accommodation not found.');
  }

  console.log("Id da acomodação", accommodationId)

  let tripId = validateTripId(payload.trip_id);

  const trip = await tripRepository.findTripById(tripId)
    
  if (!trip) {
    throw new NotFoundError('Viagem não encontrada para criar reserva de estadia.');
  }
  
  console.log("Id da viagem", tripId)

  console.log("os meus valores a inserir são", accommodationId, tripId, reserve.check_in_date, reserve.check_out_date)

  const duplicatedReserve = await reserveRepository.listDuplicatedReserves( accommodationId, tripId, reserve.check_in_date, reserve.check_out_date)

 if (duplicatedReserve) {
    throw new ValidationError('Esta reserva já existe.');
  }

 let newReserve = await reserveRepository.createReserve( accommodationId, tripId, reserve.check_in_date, reserve.check_out_date)

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
      .findAccommodationById(validatedReserve.accommodation_id);

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