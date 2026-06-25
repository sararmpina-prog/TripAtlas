/* Camada responsável pela comunicação com a BD.

Importante: Base de dados → snake_case */

import { db } from '../infra/db/db.js';

// LISTA TODOS AS SUGESTÕES
export async function listSuggestionsByTripId(tripId, tripName, userId) {
  const [rows] = await db.execute(`
    SELECT id, title, content
    FROM ai_suggestions
    WHERE trip_id = ?
    OR (trip_id IS NULL AND trip_name = ? AND user_id = ?)
  `, [tripId, tripName, userId]);

  console.log("estou no ult repositorio", rows)
  return rows;
}


// export async function updateTripIdSuggestions(tripId) {

//   const [rows] = await db.execute(`
//     UPDATE ai_suggestions s
//     INNER JOIN trips t
//     ON s.trip_name = t.title
//     AND s.user_id = t.user_id
//     SET s.trip_id = t.id
//     WHERE s.trip_id IS NULL;
//   `, [tripId]);

//   console.log("estou no repositorio de atualização de trip_id nas ai_suggestions", rows)
  
// }