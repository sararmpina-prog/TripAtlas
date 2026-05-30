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

  return rows[0];
}

// APAGA UM VOO EXISTENTE
export async function deleteReserve(id) {
  const [result] = await db.execute(
    `
     'DELETE FROM accommodation_reserve WHERE id = ?'
    `,
    [id]
  );

  // Retorna true se eliminou um registo, false caso contrário
  return result.affectedRows > 0;
}


