/* 
Responsável por:
    - resumir histórico quando passa o limite
    - manter só resumo + mensagens recentes
*/

import { summarizeHistory } from '../summarizeHistory.js';

export async function compactHistoryIfNeeded(history) {
  if (history.length <= 20) {
    return history;
  }

  const oldHistory = history.slice(0, -10);
  const recent = history.slice(-10);

  const summary = await summarizeHistory(oldHistory);

  return [
    {
      role: 'user',
      parts: [
        {
          text: 'Resumo da conversa anterior:\n' + summary,
        },
      ],
    },
    ...recent,
  ];
}
