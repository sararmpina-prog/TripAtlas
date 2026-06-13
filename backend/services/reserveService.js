import * as reserveRepository from '../repository/reserveRepository.js';
import * as tripRepository from '../repository/tripRepository.js';
import * as accommodationRepository from '../repository/accommodationRepository.js';
import { NotFoundError, ValidationError, ForbiddenError} from '../utils/appErrors.js';

// LISTA TODAS AS RESERVAS DE UM UTILIZADOR (Filtrado por segurança)
export async function listAccommodationsReserves() {
  const reserves = await reserveRepository.listReserves();

  return reserves; // Retorna o array direto da BD
}

// APAGA UMA RESERVA EXISTENTE
export async function deleteAccommodationReserve(id) {

  const reserve = await reserveRepository.findReserveById(id)

  if (!reserve) {
    throw new NotFoundError('Reserve not found.');
  }

   // Apaga a reserva diretamente da base de dados
  await reserveRepository.deleteReserve(id);
  
  return reserve; // Retorna a linha direta em snake_case
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

  const trip = await tripRepository.findTripById(reserve.trip_id)
    
  if (!trip) {
    throw new NotFoundError('Trip not found.');
  }
  
  console.log("Id da viagem", trip)

  console.log("os meus valores a inserir são", reserve)

  const duplicatedReserve = await reserveRepository.listDuplicatedReserves(reserve)

 if (duplicatedReserve) {
    throw new ValidationError('This reserve already exists.');
  }

 let newReserve = await reserveRepository.createReserve(reserve)

 let createdReserve = await reserveRepository.findReserveById(newReserve)

  return createdReserve;
}

// ATUALIZA UMA RESERVA EXISTENTE (PATCH)

export async function updateReserve(id, validatedReserve) {

  //Se reserva existe 
  console.log("Service patch reserva id", id)
  const existingReserve = await reserveRepository.findReserveById(id);

  if (!existingReserve) {
    throw new NotFoundError('Reserve not found.');
  }

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

    const trip = await tripRepository
      .findTripById(validatedReserve.trip_id);

    if (!trip) {
      throw new NotFoundError('Trip not found.');
    }
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


  console.log("serviço validatedReserve", updateData)

  await reserveRepository.updateReserve(id, updateData);

  const updatedReserve = await reserveRepository.findReserveById(id);

  return updatedReserve;

}

// LISTA TODAS AS RESERVAS DO UTILIZADOR AUTENTICADO
export async function listAccommodationsReservesByUser(currentUserId) {
  return await reserveRepository.listReservesByUserId(currentUserId);
}