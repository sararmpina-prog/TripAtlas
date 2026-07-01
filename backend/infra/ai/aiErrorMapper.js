/* Camada de abstração de erros do provider de IA. Como a Gemini pode devolver erros em formatos diferentes, este ficheiro normaliza esses erros para um formato consistente interno da aplicação através de parsing do Zod.

- Separa erros de infraestrutura (AI) da lógica de negócio
- Converte erros técnicos em mensagens user-friendly
- Identifica erros transitórios vs permanentes
- Centraliza o tratamento de erros da Gemini
*/
import { z } from 'zod';

// Schema para validar e extrair dados caso o erro venha num formato JSON estruturado
const geminiJsonErrorSchema = z.object({
  error: z.object({
    code: z.coerce.number().optional(),
    status: z.string().optional(),
    message: z.string().optional(),
  })
});

function extractProviderErrorInfo(error) {

  const message = error?.message || '';
  let parsedJson = null;

  try {
    parsedJson = JSON.parse(message);
  } catch {
    parsedJson = null;
  }

  if (parsedJson) {
    try {
      const parsedData =
        geminiJsonErrorSchema.parse(parsedJson);

      return {
        code: parsedData.error.code,
        status: parsedData.error.status,
        message: parsedData.error.message || message,
      };
    } catch {
      // JSON existe mas não bate no schema
    }
  }

  // fallback string-based
  return {
    code:
      message.includes('429') ? 429 :
      message.includes('503') ? 503 :
      message.includes('404') ? 404 :
      null,

    status:
      message.includes('RESOURCE_EXHAUSTED')
        ? 'RESOURCE_EXHAUSTED'
        : message.includes('UNAVAILABLE')
        ? 'UNAVAILABLE'
        : message.includes('NOT_FOUND')
        ? 'NOT_FOUND'
        : null,

    message,
  };
}

/* Erros de limite de taxa (429) e indisponibilidade temporária (503) são considerados transitórios enquanto erros de recurso não encontrado (404) indicam um problema de configuração que deve ser corrigido pelo desenvolvedor.
*/
export function isTransientGeminiError(error) {
  const providerError = extractProviderErrorInfo(error);
  return providerError.code === 429 || providerError.code === 503 || providerError.status === 'RESOURCE_EXHAUSTED' || providerError.status === 'UNAVAILABLE';
}

// UX Final - Converte erros técnicos da Gemini em mensagens amigáveis para o usuário final
export function formatAIError(error) {
  const providerError = extractProviderErrorInfo(error);

  if (providerError.code === 429 || providerError.status === 'RESOURCE_EXHAUSTED') {
    return 'AI has reached the temporary request limit. Please try again shortly.';
  }
  if (providerError.code === 503 || providerError.status === 'UNAVAILABLE') {
    return 'Gemini is temporarily unavailable. Please try again shortly.';
  }
  if (providerError.code === 404 || providerError.status === 'NOT_FOUND') {
    return 'The configured Gemini model is not available. Please check the GEMINI_MODEL variable.';
  }

  return providerError.message || 'Unknown error in AI call';
}
