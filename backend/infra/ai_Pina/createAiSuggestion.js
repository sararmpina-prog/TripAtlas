//Precisamos validar tripId existe antes de inserir BD (isto é repositório)

import { db } from '../../infra/db/db.js'

export async function createAiSuggestion({ trip_id, title, content }) {
  console.log("estou no createAiSuggestion", trip_id)
  console.log("estou no createAiSuggestion", title)
  console.log("estou no createAiSuggestion", content)
  const [result] = await db.execute(
    `
    INSERT INTO ai_suggestions (
      trip_id,
      title,
      content
    )
    VALUES (?, ?, ?)
    `,
    [trip_id, title, content]
  );

  return {
    success: true,
    suggestion_id: result.insertId
  };
}