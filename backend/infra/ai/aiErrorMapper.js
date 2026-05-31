/* Camada de abstração de erros da Gemini. Normaliza as respostas de falha 
   para um formato consistente interno da aplicação através de parsing do Zod. */

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

  // O Zod testa nativamente se a string é um JSON válido e se bate certo com o Schema
  const jsonParseResult = z.string().json().safeParse(message);

  if (jsonParseResult.success) {
    // Se for JSON, extraímos com segurança total
    const parsedData = geminiJsonErrorSchema.parse(JSON.parse(message));
    return {
      code: parsedData.error.code,
      status: parsedData.error.status,
      message: parsedData.error.message || message,
    };
  }

  // Fallback caso o erro venha como string simples (texto puro)
  return {
    code: message.includes('429') ? 429 : message.includes('503') ? 503 : message.includes('404') ? 404 : null,
    status: message.includes('RESOURCE_EXHAUSTED') ? 'RESOURCE_EXHAUSTED'
          : message.includes('UNAVAILABLE') ? 'UNAVAILABLE'
          : message.includes('NOT_FOUND') ? 'NOT_FOUND' : null,
    message,
  };
}

export function isTransientGeminiError(error) {
  const providerError = extractProviderErrorInfo(error);
  return providerError.code === 429 || providerError.code === 503 || providerError.status === 'RESOURCE_EXHAUSTED' || providerError.status === 'UNAVAILABLE';
}

export function formatAIError(error) {
  const providerError = extractProviderErrorInfo(error);

  if (providerError.code === 429 || providerError.status === 'RESOURCE_EXHAUSTED') {
    return 'A IA atingiu o limite temporário de pedidos. Tenta novamente daqui a pouco.';
  }
  if (providerError.code === 503 || providerError.status === 'UNAVAILABLE') {
    return 'A Gemini está temporariamente indisponível. Tenta novamente dentro de instantes.';
  }
  if (providerError.code === 404 || providerError.status === 'NOT_FOUND') {
    return 'O modelo Gemini configurado não está disponível. Verifica a variável GEMINI_MODEL.';
  }

  return providerError.message || 'Erro desconhecido na chamada à AI';
}
