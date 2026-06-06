/*
  Camada de repositório de chat (Chat History Repository)

  Base de dados → snake_case

  Responsabilidade:
  - persistir mensagens do utilizador e respostas da AI associadas a uma viagem
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
export async function saveChat({ trip_id, user_message, ai_response }) {
  const query = `
    INSERT INTO chat_history (trip_id, user_message, ai_response)
    VALUES (?, ?, ?)
  `;

  const values = [trip_id, user_message, ai_response];
  await db.execute(query, values);
}

// Recupera histórico de chat de uma viagem específica formatado para a Gemini API.
export async function getChatHistoryByTrip(trip_id, limit = 10) {
  const safeLimit = limitSchema.parse(limit);

  const query = `
    SELECT user_message, ai_response
    FROM chat_history
    WHERE trip_id = ?
    ORDER BY id DESC
    LIMIT ${safeLimit}
  `;

  const [rows] = await db.execute(query, [trip_id]);

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