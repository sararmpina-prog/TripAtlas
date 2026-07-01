import * as reserveRepository from '../repository/reserveRepository.js';
import * as tripRepository from '../repository/tripRepository.js';
import * as accommodationRepository from '../repository/accommodationRepository.js';
import { NotFoundError, ValidationError, ForbiddenError} from '../utils/appErrors.js';

async function getOwnedTripOrThrow(tripId, currentUserId, notFoundMessage = 'Trip not found.') {
  const trip = await tripRepository.findTripById(tripId);

  if (!trip) {
    throw new NotFoundError(notFoundMessage);
  }

  if (Number(trip.user_id) !== Number(currentUserId)) {
    throw new ForbiddenError('You can only manage reserves from your own trips.');
  }

  return trip;
}

// LISTA TODAS AS RESERVAS DE UM UTILIZADOR (Filtrado por segurança)
export async function listAccommodationsReserves() {
  const reserves = await reserveRepository.listReserves();

  return reserves; // Retorna o array direto da BD
}

// APAGA UMA RESERVA EXISTENTE
export async function deleteAccommodationReserve(id, currentUserId) {

  const reserve = await reserveRepository.findReserveById(id)

  if (!reserve) {
    throw new NotFoundError('Reserve not found.');
  }

  await getOwnedTripOrThrow(reserve.trip_id, currentUserId);

   // Apaga a reserva diretamente da base de dados
  await reserveRepository.deleteReserve(id);
  
  return reserve; // Retorna a linha direta em snake_case
}

//Cria reserva
export async function createReserve(payload, currentUserId) {
  const reserve = payload
  
  const accommodation = await accommodationRepository.findAccommodationById(reserve.accommodation_id)
      
  if (!accommodation) {
    throw new NotFoundError('Accommodation not found.');
  }

  await getOwnedTripOrThrow(reserve.trip_id, currentUserId);

  const duplicatedReserve = await reserveRepository.listDuplicatedReserves(reserve)

 if (duplicatedReserve) {
    throw new ValidationError('This reserve already exists.');
  }

 let newReserve = await reserveRepository.createReserve(reserve)

 let createdReserve = await reserveRepository.findReserveById(newReserve)

  return createdReserve;
}

// ATUALIZA UMA RESERVA EXISTENTE (PATCH)

export async function updateReserve(id, currentUserId, validatedReserve) {
  const existingReserve = await reserveRepository.findReserveById(id);

  if (!existingReserve) {
    throw new NotFoundError('Reserve not found.');
  }

  await getOwnedTripOrThrow(existingReserve.trip_id, currentUserId);

  const updateData = {
    accommodation_id: validatedReserve.accommodation_id ?? existingReserve.accommodation_id,
    trip_id: validatedReserve.trip_id ?? existingReserve.trip_id,
  };

  // Se acomodação existe
  if (validatedReserve.accommodation_id !== undefined) {

    const accommodation = await accommodationRepository
      .findAccommodationById(validatedReserve.accommodation_id);

    if (!accommodation) {
      throw new NotFoundError('Accommodation not found.');
    }
  }

  // Validar trip caso seja alterada
  if (validatedReserve.trip_id !== undefined) {
    await getOwnedTripOrThrow(validatedReserve.trip_id, currentUserId);
  }

  // Validar datas usando o estado atual da BD
  const checkInDate = validatedReserve.check_in_date
    ? validatedReserve.check_in_date
    : existingReserve.check_in_date;

  const checkOutDate = validatedReserve.check_out_date
    ? validatedReserve.check_out_date
    : existingReserve.check_out_date;

  if (
    validatedReserve.check_in_date !== undefined ||
    validatedReserve.check_out_date !== undefined
  ) {
    if (checkOutDate < checkInDate) {
      throw new ValidationError(
        'The check_out_date cannot be earlier than the check_in_date.'
      );
    }
  }

  updateData.check_in_date = checkInDate;
  updateData.check_out_date = checkOutDate;

  await reserveRepository.updateReserve(id, updateData);

  const updatedReserve = await reserveRepository.findReserveById(id);

  return updatedReserve;

}

// LISTA TODAS AS RESERVAS DO UTILIZADOR AUTENTICADO
export async function listAccommodationsReservesByUser(currentUserId) {
  return await reserveRepository.listReservesByUserId(currentUserId);
}