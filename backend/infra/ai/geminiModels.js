/* Configuração de modelos Gemini usada pela infraestrutura AI.

Este ficheiro centraliza apenas a política de seleção de modelos:
- modelo principal
- lista de fallbacks
- construção da sequência de candidatos
*/

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash';

export const FALLBACK_GEMINI_MODELS = (process.env.GEMINI_FALLBACK_MODELS || '')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);

export function buildModelCandidates(model = DEFAULT_GEMINI_MODEL) {
  return [model, ...FALLBACK_GEMINI_MODELS.filter((fallbackModel) => fallbackModel !== model)];
}
