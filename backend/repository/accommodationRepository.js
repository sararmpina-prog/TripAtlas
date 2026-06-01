/* Camada responsável pela comunicação com a BD.

Importante:
Base de dados → snake_case */

import { db } from '../infra/db/db.js';


// PROCURA UMA ESTADIA PELO ID
export async function findAccommodationById(id) {
  const [rows] = await db.execute(
    `
      SELECT * FROM accommodations WHERE id = ? LIMIT 1
    `,
    [id]
  );

  return rows[0];
}
