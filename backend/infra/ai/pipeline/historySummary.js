/* Responsável por:
 *  - resumir o histórico antigo usando o Gemini (modelo leve)
 *  - compactar o histórico quando ultrapassa o limite de mensagens
 *  - manter apenas o resumo + as mensagens mais recentes
 *
 * Nota: usa generateWithFallback diretamente (temperatura baixa para sumarização precisa).
 * O ficheiro summarizeHistory.js original usava uma variável 'ai' não importada — corrigido aqui.
 */

import { generateWithFallback } from '../provider/modelsFallback.js';

async function summarizeHistory(history) {
  const response = await generateWithFallback(
    [
      ...history,
      {
        role: 'user',
        parts: [
          {
            text: `
Resume esta conversa mantendo apenas:

- intenções do utilizador
- decisões tomadas
- tarefas em curso
- informação importante para continuar

Não inventes nada.
            `,
          },
        ],
      },
    ],
    { temperature: 0.1 }
  );

  return response.candidates[0].content.parts[0].text;
}

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
