/* Compressão incremental de histórico antigo para reduzir custo e limite de contexto. */

import { callGeminiWithContents } from '../infra/ai/callGemini.js';
import { SUMMARY_SYSTEM_INSTRUCTION } from '../infra/ai/prompts/summaryPrompt.js';

// Limites conservadores para evitar summaries demasiado longos.
const SUMMARY_MAX_OUTPUT_TOKENS = 120;
const SUMMARY_MAX_CHARACTERS = 280;

// Compacta espaços e impõe o limite final de caracteres.
function normalizeSummaryText(summary) {
  const compact = summary.replace(/\s+/g, ' ').trim();

  if (compact.length <= SUMMARY_MAX_CHARACTERS) {
    return compact;
  }

  return `${compact.slice(0, SUMMARY_MAX_CHARACTERS - 3).trimEnd()}...`;
}

// Resume histórico antigo reutilizando o summary anterior quando ele já existe.
export async function summarizeHistory(messages, previousSummary = null) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return previousSummary || '';
  }

  const contents = [
    // memória anterior (compressão incremental)
    ...(previousSummary
      ? [
          {
            role: 'user',
            parts: [{ text: `[RESUMO ANTERIOR] ${previousSummary}` }],
          },
        ]
      : []), // garante que o sistema funciona mesmo sem resumo anterior

    // mensagens antigas
    ...messages,

    // tarefa de compressão
    {
      role: 'user',
      parts: [
        {
          text: `
Resume a conversa com base no histórico fornecido.

Inclui apenas:
- pedidos do utilizador
- detalhes relevantes da viagem
- sugestões dadas pela AI
- decisões ou preferências confirmadas

Ignora:
- saudações
- repetições
- informação irrelevante
          `.trim(),
        },
      ],
    },
  ];

  const summary = await callGeminiWithContents(contents, undefined, {
    systemInstruction: SUMMARY_SYSTEM_INSTRUCTION,
    temperature: 0.1,
    maxOutputTokens: SUMMARY_MAX_OUTPUT_TOKENS,
  });

  return normalizeSummaryText(summary);
}