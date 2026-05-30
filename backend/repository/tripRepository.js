/* Camada responsável pela comunicação com a BD.
   Base de dados → snake_case */

import db from '../infra/db/db.js';

const tripFieldMap = {
  userId: 'user_id',
  title: 'title',
  description: 'description',
  destination: 'destination',
  startDate: 'start_date',
  endDate: 'end_date',
};

// Função auxiliar para converter campos de camelCase para snake_case antes de enviar para a BD
function toDbFields(data) {
  const result = {};
  for (const [camel, snake] of Object.entries(tripFieldMap)) {
    if (data[camel] !== undefined) {
      result[snake] = data[camel];
    }
  }
  return result;
}

// LISTA TODAS AS VIAGENS (Sem SELECT *)
export async function listTrips() {
  const [rows] = await db.execute(`
    SELECT 
      id, user_id, title, description, destination, start_date, end_date, created_at, updated_at 
    FROM trips
  `);
  return rows;
}

// PROCURA UMA VIAGEM PELO ID (Sem SELECT *)
export async function findTripById(id) {
  const [rows] = await db.execute(
    `
      SELECT 
        id, user_id, title, description, destination, start_date, end_date, created_at, updated_at 
      FROM trips
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );
  return rows[0]; // Retorna o registo ou undefined
}

// CRIA UMA NOVA VIAGEM
export async function createTrip(tripData) {
  const dbData = toDbFields(tripData);

  const [result] = await db.execute(
    `
      INSERT INTO trips (
        user_id, title, description, destination, start_date, end_date
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      dbData.user_id,
      dbData.title,
      dbData.description ?? null, // Campos opcionais protegidos com coalescência nula
      dbData.destination,
      dbData.start_date,
      dbData.end_date,
    ]
  );

  return result.insertId;
}

// ATUALIZA UMA VIAGEM EXISTENTE
export async function updateTrip(id, data) {
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
      UPDATE trips
      SET ${setClause}
      WHERE id = ?
    `,
    values
  );

  return result.affectedRows > 0;
}

// APAGA UMA VIAGEM EXISTENTE
export async function deleteTrip(id) {
  const [result] = await db.execute(
    `
      DELETE FROM trips
      WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
}
