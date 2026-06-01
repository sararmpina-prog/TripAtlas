/* Camada responsável pela comunicação com a BD.

Importante:
Base de dados → snake_case */

import { db } from '../infra/db/db.js';


const accommodationFieldMap = {
  accommodationId: 'accommodation_id',
  name: 'name',
  city: 'city',
  country: 'country',
};

// Converte campos de camelCase (frontend) para snake_case (BD)
export function toDbReserveFields(data) {
  const result = {};

  for (const [camel, snake] of Object.entries(accommodationFieldMap)) {
    if (data[camel] !== undefined) {
      result[snake] = data[camel];
    }
  }

  return result;
}

// LISTA TODAS AS RESERVAS
export async function listAccomodations() {
  const [rows] = await db.execute(`
    SELECT * FROM accommodations
  `);

  return rows;
}


// PROCURA UMA ESTADIA PELO ID
export async function findAccommodationById(id) {
  const [rows] = await db.execute(
    `
      SELECT * FROM accommodations WHERE id = ? LIMIT 1
    `,
    [id]
  );

  console.log("rows[0]", rows[0])
  return rows[0];
}


// APAGA UMA ESTADIA EXISTENTE
export async function deleteAccommodation(id) {
  const [result] = await db.execute(
    `
     DELETE FROM accommodations WHERE id = ?
    `,
    [id]
  );

  // Retorna true se eliminou um registo, false caso contrário
  return result.affectedRows > 0;
}


// LISTA ESTADIAS DUPLICADAS
export async function listDuplicatedAccommodation(accommodation) {
  const [rows] = await db.execute(`
   SELECT 1 FROM accommodations WHERE name = ? AND city = ? AND country = ? LIMIT 1
  `,  [accommodation.name, accommodation.city, accommodation.country]);

  // Retorna true se eliminou um registo, false caso contrário
  return rows.length > 0
}


// CRIA UMA NOVA ESTADIA
export async function createAccommodation(accommodation) {

  const [result] = await db.execute(
    `
      INSERT INTO accommodations (name, city, country)
      VALUES (?, ?, ?)
    `,
    [accommodation.name, accommodation.city, accommodation.country]
  );

    return result.insertId;
}