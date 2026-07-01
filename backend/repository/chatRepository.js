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
import { resolveTripReference } from './tripRepository.js'; 

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

export async function createAiSuggestion({ trip_id, title, content, trip_name, user_id }) {

  console.log("estou no createAiSuggestion original trip_id:", trip_id)
  console.log("estou no createAiSuggestion original trip_name:", trip_name)
  
  // Guardamos as variáveis que podem ser reparadas
  let correctedTripId = trip_id;
  let correctedTripName = trip_name;

  // ENGENHARIA DE CORREÇÃO AUTOMÁTICA:
  // Se a IA enviou um nome de viagem inventado (ex: "Paris Trip"), usamos o resolveTripReference
  // para correr a query por aproximação (LIKE) e descobrir a viagem verdadeira do utilizador.
  const incomingReference = trip_name || title;
  if (incomingReference) {
    const matchedTrip = await resolveTripReference(incomingReference, user_id);
    
    if (matchedTrip) {
      // Encontrou! Substitui o ID para o ID real da base de dados (ex: 'Paris Fashion Week' ID: 12)
      correctedTripId = matchedTrip.id;
      correctedTripName = matchedTrip.title;
      console.log(`🎯 Sucesso! Alucinação corrigida de "${trip_name}" para a viagem real: "${matchedTrip.title}" (ID: ${matchedTrip.id})`);
    }
  }

  // Executa o INSERT original na base de dados com as chaves corrigidas e higienizadas
  const [result] = await db.execute(
    `
    INSERT INTO ai_suggestions (
      trip_id,
      title,
      content,
      trip_name,
      user_id
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [correctedTripId, title, content, correctedTripName, user_id]
  );

  return {
    success: true,
    suggestion_id: result.insertId
  };
}


export async function getHistoryForGemini({user_id, chat_id}) {

  const [rows] = await db.query(
    `
    SELECT
      user_message,
      ai_response
    FROM chat_history
    WHERE user_id = ?
      AND chat_id = ?
    ORDER BY created_at ASC
    `,
    [user_id, chat_id]
  );

  const history = [];

  for (const row of rows) {

    if (row.user_message) {
      history.push({
        role: "user",
        parts: [
          {
            text: row.user_message
          }
        ]
      });
    }

    if (row.ai_response) {
      history.push({
        role: "model",
        parts: [
          {
            text: row.ai_response
          }
        ]
      });
    }
  }

  return history;
}