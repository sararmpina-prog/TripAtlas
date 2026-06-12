/* Camada responsável pela comunicação com a BD.

Importante:
Base de dados → snake_case */

import { db } from '../infra/db/db.js';

//ATUALIZA AS TENTATIVAS DE LOGIN
export async function updateLoginAttempts(userId, data) {
  console.log("data é", data)
  await db.execute(
    `
    UPDATE users
    SET failed_login_attempts = ?,
        locked_until = ?
    WHERE id = ?
    `,
    [
      data.failed_login_attempts,
      data.locked_until,
      userId
    ]
  );
}