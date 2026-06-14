/* Camada responsável pela comunicação com a BD.

Importante:
Base de dados → snake_case */

import { db } from '../infra/db/db.js';

// LISTA TODAS AS RESERVAS
export async function listReserves() {
  const [rows] = await db.execute(`
    SELECT * FROM accommodation_reserve
  `);

  return rows;
}

// PROCURA UMA RESERVA PELO ID
export async function findReserveById(id) {
  const [rows] = await db.execute(
    `
      SELECT * FROM accommodation_reserve WHERE id = ? LIMIT 1
    `,
    [id]
  );

  return rows[0] ?? null;
}

// APAGA UMA RESERVA EXISTENTE
export async function deleteReserve(id) {
  const [result] = await db.execute(
    `
     DELETE FROM accommodation_reserve WHERE id = ?
    `,
    [id]
  );

  // Retorna true se eliminou um registo, false caso contrário
  return result.affectedRows > 0;
}


// LISTA RESERVAS DUPLICADAS
export async function listDuplicatedReserves(reserve) {
  const [rows] = await db.execute(`
   SELECT 1 FROM accommodation_reserve WHERE accommodation_id = ? AND trip_id = ? AND check_in_date = ? AND check_out_date = ? LIMIT 1
  `,  [reserve.accommodation_id, reserve.trip_id, reserve.check_in_date, reserve.check_out_date]);

  // Retorna true se eliminou um registo, false caso contrário
  return rows.length > 0;
}


// CRIA UMA NOVA RESERVA
export async function createReserve(reserve) {

  const [result] = await db.execute(
    `
      INSERT INTO accommodation_reserve (accommodation_id, trip_id, check_in_date, check_out_date)
      VALUES (?, ?, ?, ?)
    `,
    [reserve.accommodation_id, reserve.trip_id, reserve.check_in_date, reserve.check_out_date]
  );

  return result.insertId;
}

// ATUALIZA UMA NOVA RESERVA
export async function updateReserve(id, reserve) {

  const [result] = await db.execute(
   `UPDATE accommodation_reserve
      SET
        accommodation_id = ?,
        trip_id = ?,
        check_in_date = ?,
        check_out_date = ?
      WHERE id = ?
    `,
    [
      reserve.accommodation_id,
      reserve.trip_id,
      reserve.check_in_date,
      reserve.check_out_date,
      id
    ]);

  return result.affectedRows > 0;
}

// // LISTA TODAS AS RESERVAS DE UM UTILIZADOR ESPECÍFICO
export async function listReservesByUserId(userId) {
  const [rows] = await db.execute(`
    SELECT ar.* 
    FROM accommodation_reserve ar
    INNER JOIN trips t ON ar.trip_id = t.id
    WHERE t.user_id = ?
  `, [userId]);

  return rows;
}