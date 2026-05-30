/* Camada responsável pela comunicação com a BD.

Importante:
Base de dados → snake_case */

import db from '../infra/db/db.js';

const flightFieldMap = {
  tripId: 'trip_id',
  flightNumber: 'flight_number',
  airline: 'airline',
  departureAirport: 'departure_airport',
  arrivalAirport: 'arrival_airport',
  departureDatetime: 'departure_datetime',
  arrivalDatetime: 'arrival_datetime',
};

// função auxiliar para converter campos de camelCase para snake_case antes de enviar para a BD
function toDbFields(data) {
  const result = {};

  for (const [camel, snake] of Object.entries(flightFieldMap)) {
    if (data[camel] !== undefined) {
      result[snake] = data[camel];
    }
  }

  return result;
}

// LISTA TODOS OS VOOS
export async function listFlights() {
  const [rows] = await db.execute(`
    SELECT 
      id, trip_id, flight_number, airline, departure_airport, arrival_airport, departure_datetime, arrival_datetime, created_at, updated_at
    FROM flights
  `);

  return rows;
}

// PROCURA UM VOO PELO ID
export async function findFlightById(id) {
  const [rows] = await db.execute(
    `
      SELECT 
        id, trip_id, flight_number, airline, departure_airport, arrival_airport, departure_datetime, arrival_datetime, created_at, updated_at
      FROM flights
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0];
}

// LISTA TODOS OS VOOS DE UMA VIAGEM
export async function getFlightsByTripId(tripId) {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        trip_id,
        flight_number,
        airline,
        departure_airport,
        arrival_airport,
        departure_datetime,
        arrival_datetime,
        created_at,
        updated_at
      FROM flights
      WHERE trip_id = ?
    `,
    [tripId]
  );

  return rows;
}

// CRIA UM NOVO VOO
export async function createFlight(flightData) {
  const dbData = toDbFields(flightData);

  const [result] = await db.execute(
    `
      INSERT INTO flights (
        trip_id,
        flight_number,
        airline,
        departure_airport,
        arrival_airport,
        departure_datetime,
        arrival_datetime
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
        dbData.trip_id,
        dbData.flight_number ?? null,
        dbData.airline ?? null,
        dbData.departure_airport ?? null,
        dbData.arrival_airport ?? null,
        dbData.departure_datetime, 
        dbData.arrival_datetime,
    ]
  );

  return result.insertId;
}

// ATUALIZA UM VOO EXISTENTE
export async function updateFlight(id, data) {
  const dbData = toDbFields(data);
  const fields = Object.keys(dbData);

  if (fields.length === 0) return true; 

  const setClause = fields
    .map(field => `${field} = ?`)
    .join(', ');

  const values = fields.map(field => dbData[field]);
  values.push(id);

  const [result] = await db.execute(
    `
      UPDATE flights
      SET ${setClause}
      WHERE id = ?
    `,
    values
  );

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
