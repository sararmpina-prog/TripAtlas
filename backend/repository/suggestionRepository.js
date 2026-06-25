/* Camada responsável pela comunicação com a BD.

Importante: Base de dados → snake_case */

import { db } from '../infra/db/db.js';

// LISTA TODOS AS SUGESTÕES
export async function listSuggestionsByTripId(tripId) {
  const [rows] = await db.execute(`
    SELECT id, title, content
    FROM ai_suggestions
    WHERE trip_id = ?
  `, [tripId]);

  console.log("estou no ult repositorio", rows)
  return rows;
}
