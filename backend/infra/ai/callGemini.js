/* Camada genérica de comunicação com a Gemini.

Responsabilidades:
- validar configuração base
- executar chamadas ao provider
- aplicar retry/fallback de modelos
- devolver texto ou resposta bruta

Esta camada não conhece prompts, tools nem comportamento específico do assistente.
*/

import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { formatAIError, isTransientGeminiError } from './aiErrorMapper.js';
import { logGeminiDebug } from './aiDebugLogger.js';
import { validateBaseConfig, validateContents } from './aiValidators.js';
import { DEFAULT_GEMINI_MODEL, buildModelCandidates } from './geminiModels.js';

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY,
});

function buildFinalConfig(config = {}) {
	return {
		...config,
		temperature: typeof config.temperature === 'number' ? config.temperature : 0.2,
	};
}

async function generateGeminiResponse(contents, model, config) {
	return ai.models.generateContent({
		model,
		contents,
		config,
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
					message: error?.message || 'Erro desconhecido',
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

function extractResponseText(response) {
	const text = response?.text?.trim();

	if (text) {
		return text;
	}

	const partsText = response?.candidates?.[0]?.content?.parts
		?.filter((part) => typeof part?.text === 'string' && !part.thought)
		.map((part) => part.text.trim())
		.filter(Boolean)
		.join('\n');

	if (!partsText) {
		throw new Error('Resposta vazia da AI');
	}

	return partsText;
}

export async function callGemini(prompt, model = DEFAULT_GEMINI_MODEL, config = {}) {
	try {
		logGeminiDebug('ai-call', 'call-gemini-start', {
			model,
			promptLength: typeof prompt === 'string' ? prompt.length : 0,
		});

		validateBaseConfig(config);

		if (!prompt || typeof prompt !== 'string') {
			throw new Error('Prompt inválido para a chamada à AI');
		}

		const response = await generateGeminiResponseWithRetry(
			[{ role: 'user', parts: [{ text: prompt }] }],
			model,
			buildFinalConfig(config)
		);

		return extractResponseText(response);
	} catch (error) {
		throw new Error(`Erro na chamada à AI: ${formatAIError(error)}`);
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

		const response = await generateGeminiResponseWithRetry(contents, model, buildFinalConfig(config));
		return extractResponseText(response);
	} catch (error) {
		throw new Error(`Erro na chamada à AI: ${formatAIError(error)}`);
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

		return await generateGeminiResponseWithRetry(contents, model, buildFinalConfig(config));
	} catch (error) {
		throw new Error(`Erro na chamada à AI: ${formatAIError(error)}`);
	}
}
