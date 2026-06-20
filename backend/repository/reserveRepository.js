/* Camada responsável pela comunicação com a BD.

Importante:
Base de dados → snake_case */

import { db } from '../infra/db/db.js';

// FUNÇÃO AUXILIAR: Atualiza o updated_at da TRIP associada para a data/hora atual
async function touchTripTimestamp(tripId) {
  if (!tripId) return;
  await db.execute(
    'UPDATE trips SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [tripId]
  );
}

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
  // CASO DE ELIMINAÇÃO: Descobre o trip_id antes de apagar o registo da BD
  const reserve = await findReserveById(id);

  const [result] = await db.execute(
    `
     DELETE FROM accommodation_reserve WHERE id = ?
    `,
    [id]
  );

  if (result.affectedRows > 0 && reserve) {
    await touchTripTimestamp(reserve.trip_id);
  }

  return result.affectedRows > 0;
}

// LISTA RESERVAS DUPLICADAS
export async function listDuplicatedReserves(reserve) {
  const [rows] = await db.execute(`
   SELECT 1 FROM accommodation_reserve WHERE accommodation_id = ? AND trip_id = ? AND check_in_date = ? AND check_out_date = ? AND check_in_time <=> ? AND check_out_time <=> ? LIMIT 1
  `,  [reserve.accommodation_id, reserve.trip_id, reserve.check_in_date, reserve.check_out_date, reserve.check_in_time ?? null, reserve.check_out_time ?? null]);

  return rows.length > 0;
}

// CRIA UMA NOVA RESERVA
export async function createReserve(reserve) {
  const [result] = await db.execute(
    `
      INSERT INTO accommodation_reserve (accommodation_id, trip_id, check_in_date, check_out_date, check_in_time, check_out_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      reserve.accommodation_id,
      reserve.trip_id,
      reserve.check_in_date,
      reserve.check_out_date,
      reserve.check_in_time ?? null,
      reserve.check_out_time ?? null,
    ]
  );

  // CASO DE CRIAÇÃO: O trip_id vem direto nos dados do parâmetro
  await touchTripTimestamp(reserve.trip_id);

  return result.insertId;
}

// ATUALIZA UMA RESERVA EXISTENTE
export async function updateReserve(id, reserve) {
  const [result] = await db.execute(
   `UPDATE accommodation_reserve
      SET
        accommodation_id = ?,
        trip_id = ?,
        check_in_date = ?,
        check_out_date = ?,
        check_in_time = ?,
        check_out_time = ?
      WHERE id = ?
    `,
    [
      reserve.accommodation_id,
      reserve.trip_id,
      reserve.check_in_date,
      reserve.check_out_date,
      reserve.check_in_time ?? null,
      reserve.check_out_time ?? null,
      id
    ]);

  if (result.affectedRows > 0) {
    // CASO DE EDIÇÃO: Garante o "toque" na viagem correta
    await touchTripTimestamp(reserve.trip_id);
  }

  return result.affectedRows > 0;
}

// LISTA TODAS AS RESERVAS DE UM UTILIZADOR ESPECÍFICO
export async function listReservesByUserId(userId) {
  const [rows] = await db.execute(`
    SELECT
      ar.id, 
      ar.accommodation_id, 
      ar.trip_id, 
      ar.check_in_date, 
      ar.check_out_date,
      ar.check_in_time,
      ar.check_out_time,
      a.name AS accommodation_name
    FROM accommodation_reserve ar
    INNER JOIN trips t ON ar.trip_id = t.id
    INNER JOIN accommodations a ON ar.accommodation_id = a.id
    WHERE t.user_id = ?
  `, [userId]);

  return rows;
}
