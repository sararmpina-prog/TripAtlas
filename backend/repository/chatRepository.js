/*
  Camada de repositório de chat (Chat History Repository)

  Responsabilidade:
  - persistir mensagens do utilizador e respostas da AI associadas a uma viagem
  - recuperar histórico de conversa cronológico estruturado para a Gemini API

  Este ficheiro NÃO contém:
  - lógica de negócio (ex: decisões da AI)
  - prompts
  - regras de tools/function calling
*/

import { db } from '../infra/db/db.js';
import { z } from 'zod';

// Validador simples do Zod para garantir um limite numérico limpo e seguro para o SQL
const limitSchema = z.coerce.number().int().positive().catch(10);

/* Persiste uma interação completa no histórico de chat.
   Sincronizado estritamente com as colunas da tabela chat_history do db.js */
export async function saveChat({ tripId, userMessage, aiResponse }) {
  const query = `
    INSERT INTO chat_history (trip_id, user_message, ai_response)
    VALUES (?, ?, ?)
  `;

  const values = [tripId, userMessage, aiResponse];

  await db.execute(query, values);
}

/* Recupera histórico de chat de uma viagem específica formatado para a Gemini API. */
export async function getChatHistoryByTrip(tripId, limit = 10) {
  const safeLimit = limitSchema.parse(limit);

  // Filtragem por trip_id mapeada com o auto-healing schema
  const query = `
    SELECT user_message, ai_response
    FROM chat_history
    WHERE trip_id = ?
    ORDER BY id DESC
    LIMIT ${safeLimit}
  `;

  const [rows] = await db.execute(query, [tripId]);

  /* Conversão de DB rows -> formato Gemini contents
     Cada row representa 1 turno:
     - user_message → role: 'user'
     - ai_response → role: 'model'
  */
  return rows
    .reverse() // Inverte para repor a ordem cronológica correta
    .flatMap((row) => {
      const messages = [];

      // Mensagem do utilizador
      if (typeof row.user_message === 'string' && row.user_message.trim()) {
        messages.push({
          role: 'user',
          parts: [{ text: row.user_message.trim() }],
        });
      }

      // Resposta da AI
      if (typeof row.ai_response === 'string' && row.ai_response.trim()) {
        messages.push({
          role: 'model',
          parts: [{ text: row.ai_response.trim() }],
        });
      }

      return messages;
    });
}