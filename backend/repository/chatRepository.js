/*
  Camada de repositório de chat (Chat History Repository)

  Base de dados → snake_case

  Responsabilidade:
  - persistir mensagens do utilizador e respostas da AI associadas a um utilizador
  - suportar histórico geral sem viagem e histórico contextualizado por viagem
  - recuperar histórico de conversa cronológico estruturado para a Gemini API

  Este ficheiro NÃO contém:
  - lógica de negócio (ex: decisões da AI)
  - prompts
*/

import { db } from '../infra/db/db.js';
import { z } from 'zod';

// Validador simples do Zod para garantir um limite numérico limpo e seguro para o SQL
const limitSchema = z.coerce.number().int().positive().catch(10);

// Persiste uma interação completa no histórico de chat.
export async function saveChat({ user_id, trip_id = null, chat_id, user_message, ai_response }) {
  console.log("repository trip id", trip_id)
  console.log("repository user_id", user_id)
  console.log("repository chat_id", chat_id)
  console.log("repository user_message", user_message)
  console.log("repository ai_response", ai_response)
  const query = `
    INSERT INTO chat_history (user_id, trip_id, user_message, ai_response, chat_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [user_id, trip_id, user_message, ai_response, chat_id];
  await db.execute(query, values);
}

// Recupera histórico de chat de um utilizador, com ou sem viagem associada.
export async function getChatHistory({ user_id, trip_id = null }, limit = 10) {
  const safeLimit = limitSchema.parse(limit);
  console.log("user_id", user_id)
  console.log("trip_id", trip_id)
  console.log("trip_id", trip_id)

  const hasTripScope = trip_id !== null && trip_id !== undefined;
  const query = hasTripScope
    ? `
        SELECT user_message, ai_response
        FROM chat_history
        WHERE user_id = ? AND trip_id = ?
        ORDER BY id DESC
        LIMIT ${safeLimit}
      `
    : `
        SELECT user_message, ai_response
        FROM chat_history
        WHERE user_id = ? AND trip_id IS NULL
        ORDER BY id DESC
        LIMIT ${safeLimit}
      `;

  const [rows] = await db.execute(
    query,
    hasTripScope ? [user_id, trip_id] : [user_id]
  );

  return rows
    .reverse() // Inverte para repor a ordem cronológica correta
    .flatMap((row) => { // flatMap para transformar cada row num array de mensagens, filtrando mensagens vazias ou nulas
      const messages = [];

      if (typeof row.user_message === 'string' && row.user_message.trim()) {
        messages.push({
          role: 'user',
          parts: [{ text: row.user_message.trim() }],
        });
      }

      if (typeof row.ai_response === 'string' && row.ai_response.trim()) {
        messages.push({
          role: 'model',
          parts: [{ text: row.ai_response.trim() }],
        });
      }

      return messages;
    });
}

export async function getMessagesByChatId({ user_id, chat_id }) {
  console.log("estou no repositório")
  console.log("user_id", user_id)
  console.log("chat_id", chat_id)


  const [rows] = await db.query(`
    SELECT user_message, ai_response, created_at
    FROM chat_history
    WHERE user_id = ?
      AND chat_id = ?
    ORDER BY created_at ASC
  `, [user_id, chat_id]);

  console.log("rows", rows)

  // return rows

 return rows.flatMap(row => ([
  {
    sender: "user",
    text: row.user_message,
    created_at: row.created_at
  },
  {
    sender: "ai",
    text: row.ai_response,
    created_at: row.created_at
  }
]));
}