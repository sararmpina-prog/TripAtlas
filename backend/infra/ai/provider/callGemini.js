/* Camada genérica de comunicação com a Gemini.
 *
 * Responsabilidades:
 *  - executar uma chamada direta e genérica ao SDK (@google/genai)
 *  - aplicar fallback de modelos via generateWithFallback
 *  - registar erros técnicos do provider
 *
 * Esta camada não conhece prompts, tools nem comportamento específico do assistente.
 * Recebe histórico e config já construídos e devolve a resposta bruta do Gemini.
 */

import 'dotenv/config';
import { logGeminiDebug } from './aiDebugLogger.js';
import { generateWithFallback } from './modelsFallback.js';
import { validateBaseConfig, validateContents } from './geminiValidator.js';

// @param {Array}  history - Histórico estruturado no formato do SDK
// @param {Object} config  - Configurações e Tools do modelo (systemInstruction, tools, toolConfig, etc.)
export async function callGemini(history, config) {
  validateBaseConfig(config);
  validateContents(history);
  
  try {
    let currentResponse = await generateWithFallback(history, config);
    console.log(JSON.stringify(currentResponse, null, 2));
    return currentResponse;

  } catch (error) {
    logGeminiDebug(
      'function-calling',
      'gemini-error',
      {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      }
    );
    throw error;
  }
}
