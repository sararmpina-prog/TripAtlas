/* Camada genérica de comunicação com a Gemini.

É um wrapper genérico do provider (SDK Gemini + fallback + logging de erro técnico
Esta camada não conhece prompts, tools nem comportamento específico do assistente.
*/

import 'dotenv/config';
import { logGeminiDebug } from './aiDebugLogger.js';
import { generateWithFallback } from './modelsFallback.js';

export async function callGemini(history, config) {
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
