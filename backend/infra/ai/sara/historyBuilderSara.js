/*
Responsável por:
    - buscar histórico em BD
    - fazer push da mensagem do user
*/

import * as chatRepository from '../../../repository/chatRepository.js';

export async function buildHistoryWithUserPrompt(userPrompt, chat_id, user_id) {
  let history = [];

  history = await chatRepository.getHistoryForGemini({
    user_id,
    chat_id,
  });

  history.push({
    role: 'user',
    parts: [
      {
        text: userPrompt,
      },
    ],
  });

  console.log(
    'History sent to Gemini:',
    JSON.stringify(history, null, 2)
  );

  console.log('Historico da conversa (primeiro push)', history);
  console.log('Historico:', JSON.stringify(history, null, 2));

  return history;
}
