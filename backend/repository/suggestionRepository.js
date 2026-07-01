/* Camada responsável pela comunicação com a BD.

Importante: Base de dados → snake_case */

import { db } from '../infra/db/db.js';

// LISTA TODOS AS SUGESTÕES
export async function listSuggestionsByTripId(tripId, tripReference, userId) {
  const [rows] = await db.execute(`
    SELECT id, title, content
    FROM ai_suggestions
    WHERE trip_id = ?
    OR (trip_id IS NULL AND trip_name = ? AND user_id = ?)
  `, [tripId, tripName, userId]);

  console.log("estou no ult repositorio", rows)
  return rows;
}



// PROCURA UMA SUGESTÃO PELO ID
export async function findSuggestionById(id) {
  const [rows] = await db.execute(`
    SELECT *
    FROM ai_suggestions
    WHERE id = ?
    LIMIT 1
  `, [id]);

  console.log("repositório findSuggestionByid", rows[0])
  return rows[0] ?? null;
}

// APAGA UMA SUGESTÃO EXISTENTE
export async function deleteSuggestion(id) {
  
  const [result] = await db.execute(`
    DELETE FROM ai_suggestions WHERE id = ?
  `, [id]);

  return result.affectedRows > 0;
}
