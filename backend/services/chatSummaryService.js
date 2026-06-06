import { callGeminiWithContents } from '../infra/ai/callGemini.js';
import { SUMMARY_SYSTEM_INSTRUCTION } from '../infra/ai/prompts/summaryPrompt.js';

const SUMMARY_MAX_OUTPUT_TOKENS = 120;
const SUMMARY_MAX_CHARACTERS = 280;

function normalizeSummaryText(summary) {
  const compact = summary.replace(/\s+/g, ' ').trim();
  if (compact.length <= SUMMARY_MAX_CHARACTERS) return compact;
  return `${compact.slice(0, SUMMARY_MAX_CHARACTERS - 3).trimEnd()}...`;
}

export async function summarizeHistory(messages, previousSummary = null) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return previousSummary || '';
  }

  const contents = [
    ...(previousSummary ? [{ role: 'user', parts: [{ text: `[PREVIOUS SUMMARY] ${previousSummary}` }] }] : []),
    ...messages,
    {
      role: 'user',
      parts: [
        {
          text: `
Summarize the conversation based on the history provided.
Include only:
- User preferences or destination choices.
- Relevant trip itineraries or points of interest discussed.
- Recommendations given by the AI regarding hotels, flights, or activities.
          `.trim(),
        },
      ],
    },
  ];

  // Chama a Gemini para gerar um resumo, usando o prompt específico de resumo e limitando os tokens de saída
  const summary = await callGeminiWithContents(contents, undefined, {
    systemInstruction: SUMMARY_SYSTEM_INSTRUCTION,
    temperature: 0.1,
    maxOutputTokens: SUMMARY_MAX_OUTPUT_TOKENS,
  });

  return normalizeSummaryText(summary);
}
