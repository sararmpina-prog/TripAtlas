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

export async function getChatSessions(user_id) {
  const [rows] = await db.query(`
    SELECT 
      c.chat_id,
      (
        SELECT user_message
        FROM chat_history ch2
        WHERE ch2.chat_id = c.chat_id
          AND ch2.user_id = ?
        ORDER BY ch2.created_at ASC
        LIMIT 1
      ) AS title,
      MAX(c.created_at) AS last_message
    FROM chat_history c
    WHERE c.user_id = ?
    GROUP BY c.chat_id
    ORDER BY last_message DESC
  `, [user_id, user_id]);

  return rows;
}