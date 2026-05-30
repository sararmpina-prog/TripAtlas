import { db } from '../infra/db/db.js';
import * as reserveRepository from '../repository/reserveRepository.js';
import * as tripRepository from '../repository/tripRepository.js';
import * as accommodationRepository from '../repository/accommodationRepository.js';
import {validateReserveId} from '../validators/reserveValidator.js'
import {validateCreateReserve} from '../validators/reserveValidator.js'
import {validateAccommodationId} from '../validators/accommodationValidator.js'
import {validateTripId} from '../validators/tripValidator.js'
import { NotFoundError, ValidationError} from '../utils/appErrors.js';

export async function listAccommodationsReserves() {
  const reserves = await reserveRepository.listReserves();
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



export async function createReserve(payload) {

  console.log("Estou no serviço")

  const reserve = validateCreateReserve(payload);

  console.log("A reserva é, após validações da data", reserve)

  let accommodationId = validateAccommodationId(payload.accommodation_id);
  
  const accommodation = await accommodationRepository.findAccommodationById(accommodationId)
      
  if (!accommodation) {
    throw new NotFoundError('Acomodação não encontrada para criar reserva de estadia.');
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

 let createdReserve = findReserveById(newReserve)

  return createdReserve
}