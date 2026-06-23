import {config} from './tripBotConfig.js'

//Different models available
const GEMINI_MODELS = [
    "gemini-2.5-pro",
    "gemini-3-flash",
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2-flash",
    "gemini-2-flash-lite",
    "gemini-2.5-flash-lite"
];


//Fallback for models AI
export async function generateWithFallback(contents, config) {

  let lastError = null;

  for (let i = 0; i < GEMINI_MODELS.length; i++) {

    const model = GEMINI_MODELS[i];

    try {

      logGeminiDebug(
        'gemini-provider',
        'model-attempt',
        {
          model,
          attempt: i + 1
        }
      );

      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });

      logGeminiDebug(
        'gemini-provider',
        'model-success',
        {
          model
        }
      );

      return response;

    } catch (error) {

      logGeminiDebug(
        'gemini-provider',
        'model-failure',
        {
          model,
          transient: isTransientGeminiError(error),
          formattedMessage: formatAIError(error),
          originalMessage: error.message
        }
      );

      // Modelo inexistente -> tenta o próximo
      if (
        error.status === 404 ||
        formatAIError(error).includes('configured Gemini model')
      ) {

        logGeminiDebug(
          'gemini-provider',
          'fallback-next-model',
          {
            failedModel: model
          }
        );

        continue;
      }

      lastError = error;
    }
  }

  logGeminiDebug(
    'gemini-provider',
    'all-models-failed',
    {
      modelsTried: GEMINI_MODELS,
      finalError: formatAIError(lastError)
    }
  );

  throw new Error(
    formatAIError(lastError)
  );
}

