/* Camada genérica de comunicação com a Gemini.

Responsabilidades:
- validar configuração base
- executar chamadas ao provider utilizando o SDK oficial @google/genai
- aplicar retry/fallback de modelos
- devolver texto ou resposta bruta

Esta camada não conhece prompts, tools nem comportamento específico do assistente.
*/

import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { formatAIError, isTransientGeminiError } from './aiErrorMapper.js';
import { logGeminiDebug } from './aiDebugLogger.js';
import { validateBaseConfig, validateContents } from './geminiValidator.js';
import { DEFAULT_GEMINI_MODEL, buildModelCandidates } from './geminiModels.js';

// Inicialização correta do cliente oficial da Google
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Ajusta as configurações para o formato nativo esperado pelo SDK
function buildFinalConfig(config = {}) {
  return {
    temperature: typeof config.temperature === 'number' ? config.temperature : 0.2,
    ...config,
  };
}

// Sintaxe nativa do método do novo SDK @google/genai
async function generateGeminiResponse(contents, model, config) {
  return ai.models.generateContent({
    model,
    contents,
    config: buildFinalConfig(config), // O SDK espera o objeto config aqui dentro
  });
}

async function generateGeminiResponseWithRetry(contents, model, config) {
  const modelCandidates = buildModelCandidates(model);
  let lastError;

  for (const currentModel of modelCandidates) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        logGeminiDebug('ai-call', 'model-attempt', {
          model: currentModel,
          attempt: attempt + 1,
          candidateCount: modelCandidates.length,
          contentsCount: Array.isArray(contents) ? contents.length : 0,
        });

        const response = await generateGeminiResponse(contents, currentModel, config);

        logGeminiDebug('ai-call', 'model-success', {
          model: currentModel,
          attempt: attempt + 1,
        });

        return response;
      } catch (error) {
        lastError = error;
        const transient = isTransientGeminiError(error);

        logGeminiDebug('ai-call', 'model-error', {
          model: currentModel,
          attempt: attempt + 1,
          transient,
          message: error?.message || 'Unknown error',
        });

        if (!transient) {
          throw error;
        }

        if (attempt === 1) {
          break;
        }
      }
    }
  }

  throw lastError;
}

// Extração segura utilizando os getters nativos do novo SDK
function extractResponseText(response) {
  const text = response?.text;

  if (text && typeof text === 'string') {
    return text.trim();
  }

  throw new Error('Empty or invalid response received from AI');
}

export async function callGemini(prompt, model = DEFAULT_GEMINI_MODEL, config = {}) {
  try {
    logGeminiDebug('ai-call', 'call-gemini-start', {
      model,
      promptLength: typeof prompt === 'string' ? prompt.length : 0,
    });

    validateBaseConfig(config);

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt for AI call');
    }

    // Estrutura padrão de contents aceita pela API
    const response = await generateGeminiResponseWithRetry(
      [{ role: 'user', parts: [{ text: prompt }] }],
      model,
      config
    );

    return extractResponseText(response);
  } catch (error) {
    throw new Error(`Error in AI call: ${formatAIError(error)}`);
  }
}

export async function callGeminiWithContents(contents, model = DEFAULT_GEMINI_MODEL, config = {}) {
  try {
    logGeminiDebug('ai-call', 'call-gemini-with-contents-start', {
      model,
      contentsCount: Array.isArray(contents) ? contents.length : 0,
    });

    validateBaseConfig(config);
    validateContents(contents);

    const response = await generateGeminiResponseWithRetry(contents, model, config);
    return extractResponseText(response);
  } catch (error) {
    throw new Error(`Error in AI call: ${formatAIError(error)}`);
  }
}

export async function callGeminiWithResponse(contents, model = DEFAULT_GEMINI_MODEL, config = {}) {
  try {
    logGeminiDebug('ai-call', 'call-gemini-with-response-start', {
      model,
      contentsCount: Array.isArray(contents) ? contents.length : 0,
    });

    validateBaseConfig(config);
    validateContents(contents);

    return await generateGeminiResponseWithRetry(contents, model, config);
  } catch (error) {
    throw new Error(`Error in AI call: ${formatAIError(error)}`);
  }
}
