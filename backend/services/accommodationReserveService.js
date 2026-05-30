import { db } from '../infra/db/db.js';
import * as reserveRepository from '../repository/reserveRepository.js';
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

  if (!rows[0]) {
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
  
  let [rows] = await db.execute('SELECT * FROM accommodations WHERE id = ? LIMIT 1', [accommodationId]);
      
  if (!rows[0]) {
    throw new NotFoundError('Acomodação não encontrada para criar reserva de estadia.');
  }

  console.log("Id da acomodação", accommodationId)

  let tripId = validateTripId(payload.trip_id);

  [rows] = await db.execute('SELECT * FROM trips WHERE id = ? LIMIT 1', [tripId]);
    
  if (!rows[0]) {
    throw new NotFoundError('Viagem não encontrada para criar reserva de estadia.');
  }
  
  console.log("Id da viagem", tripId)

  console.log("os meus valores a inserir são", accommodationId, tripId, reserve.check_in_date, reserve.check_out_date)

  const [duplicateRows] = await db.execute(
  ` SELECT 1 FROM accommodation_reserve WHERE accommodation_id = ? AND trip_id = ? AND check_in_date = ? AND check_out_date = ? LIMIT 1
  `,
 [accommodationId, tripId, reserve.check_in_date, reserve.check_out_date]
 );

 if (duplicateRows.length > 0) {
  throw new ValidationError('Esta reserva já existe.');
  }

  const [result] = await db.execute(
    `
      INSERT INTO accommodation_reserve (accommodation_id, trip_id, check_in_date, check_out_date)
      VALUES (?, ?, ?, ?)
    `,
    [accommodationId, tripId, reserve.check_in_date, reserve.check_out_date]
  );

 [rows] = await db.execute('SELECT * FROM accommodation_reserve WHERE id = ? LIMIT 1', [result.insertId]);

  return rows
}