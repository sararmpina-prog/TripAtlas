/* Camada responsável pela comunicação com a BD.

Importante: Base de dados → snake_case */

import { db } from '../infra/db/db.js';

function toMySqlDateTime(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// FUNÇÃO AUXILIAR: Evita repetir código em todas as ações
async function touchTripTimestamp(tripId) {
  if (!tripId) return;
  await db.execute(
    'UPDATE trips SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [tripId]
  );
}

// LISTA TODOS OS VOOS
export async function listFlightsByUserId(userId) {
  const [rows] = await db.execute(`
    SELECT f.id, f.trip_id, f.flight_number, f.airline, f.departure_airport, f.arrival_airport, f.departure_datetime, f.arrival_datetime, f.created_at, f.updated_at
    FROM flights f
    INNER JOIN trips t ON f.trip_id = t.id
    WHERE t.user_id = ?
  `, [userId]);
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
  return rows[0] ?? null;
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
  const normalizedFlightData = {
    ...flightData,
    departure_datetime: toMySqlDateTime(flightData.departure_datetime),
    arrival_datetime: toMySqlDateTime(flightData.arrival_datetime),
  };

  const [result] = await db.execute(`
    INSERT INTO flights (trip_id, flight_number, airline, departure_airport, arrival_airport, departure_datetime, arrival_datetime)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
      normalizedFlightData.trip_id,
      normalizedFlightData.flight_number ?? null,
      normalizedFlightData.airline ?? null,
      normalizedFlightData.departure_airport ?? null,
      normalizedFlightData.arrival_airport ?? null,
      normalizedFlightData.departure_datetime,
      normalizedFlightData.arrival_datetime,
  ]);

  // CASO DE CRIAÇÃO: O trip_id vem direto nos dados do formulário
  await touchTripTimestamp(normalizedFlightData.trip_id);

  return result.insertId;
}

// ATUALIZA UM VOO EXISTENTE
export async function updateFlight(id, data) {
  const normalizedData = {
    ...data,
    departure_datetime: toMySqlDateTime(data.departure_datetime),
    arrival_datetime: toMySqlDateTime(data.arrival_datetime),
  };

  const fields = Object.keys(normalizedData).filter((field) => normalizedData[field] !== undefined);
  if (fields.length === 0) return true; 

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => normalizedData[field]);
  values.push(id);

  const [result] = await db.execute(`
    UPDATE flights
    SET ${setClause}
    WHERE id = ?
  `, values);

  if (result.affectedRows > 0) {
    // CASO DE EDIÇÃO: Tem de se procurar o voo primeiro para saber qual é o seu trip_id
    const flight = await findFlightById(id);
    if (flight) await touchTripTimestamp(flight.trip_id);
  }

  return result.affectedRows > 0;
}

// APAGA UM VOO EXISTENTE
export async function deleteFlight(id) {
  // CASO DE ELIMINAÇÃO: Tem de se descobrir o trip_id ANTES de apagar o voo da BD!
  const flight = await findFlightById(id);

  const [result] = await db.execute(`
    DELETE FROM flights WHERE id = ?
  `, [id]);

  if (result.affectedRows > 0 && flight) {
    await touchTripTimestamp(flight.trip_id);
  }

  return result.affectedRows > 0;
}
