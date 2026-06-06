/* Camada responsável pela comunicação com a BD.

Importante:
Base de dados → snake_case */

import { db } from '../infra/db/db.js';

// LISTA TODOS OS VOOS
export async function listFlights() {
  const [rows] = await db.execute(`
    SELECT id, trip_id, flight_number, airline, departure_airport, arrival_airport, departure_datetime, arrival_datetime, created_at, updated_at
    FROM flights
  `);
  return rows;
}

// PROCURA UM VOO PELO ID
export async function findFlightById(id) {
  const [rows] = await db.execute(`
    SELECT id, trip_id, flight_number, airline, departure_airport, arrival_airport, departure_datetime, arrival_datetime, created_at, updated_at
    FROM flights
    WHERE id = ?
    LIMIT 1
  `, [id]);
  return rows; // Retorna o array completo conforme alinhado com o vosso flightService
}

// LISTA TODOS OS VOOS DE UMA VIAGEM
export async function getFlightsByTripId(tripId) {
  const [rows] = await db.execute(`
    SELECT id, trip_id, flight_number, airline, departure_airport, arrival_airport, departure_datetime, arrival_datetime, created_at, updated_at
    FROM flights
    WHERE trip_id = ?
  `, [tripId]);
  return rows;
}

// CRIA UM NOVO VOO
export async function createFlight(flightData) {

  const [result] = await db.execute(`
    INSERT INTO flights (trip_id, flight_number, airline, departure_airport, arrival_airport, departure_datetime, arrival_datetime)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
      flightData.trip_id,
      flightData.flight_number ?? null,
      flightData.airline ?? null,
      flightData.departure_airport ?? null,
      flightData.arrival_airport ?? null,
      flightData.departure_datetime, 
      flightData.arrival_datetime,
  ]);

  return result.insertId;
}

// ATUALIZA UM VOO EXISTENTE
export async function updateFlight(id, data) {
  const fields = Object.keys(data);
  if (fields.length === 0) return true; 

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => data[field]);
  values.push(id);

  const [result] = await db.execute(`
    UPDATE flights
    SET ${setClause}
    WHERE id = ?
  `, values);

  return result.affectedRows > 0;
}

// APAGA UM VOO EXISTENTE
export async function deleteFlight(id) {
  const [result] = await db.execute(
    `
      DELETE FROM flights
      WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
}
