/* Camada responsável pela comunicação com a BD.

Importante:
Base de dados → snake_case */

import { db } from '../infra/db/db.js';


// LISTA TODAS AS ESTADIAS
export async function listAccommodations() {
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
  return rows[0] ?? null;
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
  return rows.length > 0;
}


// CRIA UMA NOVA ESTADIA
export async function createAccommodation(accommodation) {

  const [result] = await db.execute(
    `
      INSERT INTO accommodations (name, address, city, country)
      VALUES (?, ?, ?, ?)
    `,
    [accommodation.name, accommodation.address, accommodation.city, accommodation.country]
  );

  return result.insertId;
}


// ATUALIZA UMA NOVA ESTADIA
export async function updateAccommodation(id, accommodation) {

  const [result] = await db.execute(
   `UPDATE accommodations
      SET
        name = ?,
        address = ?,
        city = ?,
        country = ?
      WHERE id = ?
    `,
    [
      accommodation.name,
      accommodation.address,
      accommodation.city,
      accommodation.country,
      id
    ]);

  return result.affectedRows > 0;
}