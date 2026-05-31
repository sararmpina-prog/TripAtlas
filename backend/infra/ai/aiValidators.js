/* Validações base da camada de infraestrutura AI usando Zod.
   A abordagem fail-fast evita chamadas inválidas à API da Gemini. */

import { z } from 'zod';

// Schema para garantir que as Variáveis de Ambiente essenciais existem
const envSchema = z.object({
  GEMINI_API_KEY: z.string({ required_error: 'GEMINI_API_KEY não definida no .env' }).min(1)
});

// Schema para validar o objeto de configuração da chamada à AI
const configSchema = z.object({}).passthrough(); // Aceita qualquer objeto, rejeita null/arrays/primitivos

// Schema para o histórico conversacional (Contents) esperado pela Gemini
const contentsSchema = z.array(z.any()).min(1, { message: 'Contents não pode estar vazio' });

export function validateBaseConfig(config) {
  // Valida o .env instantaneamente
  envSchema.parse(process.env);
  
  // Valida se o config é um objeto válido
  configSchema.parse(config);
}

export function validateContents(contents) {
  // Valida se é um array preenchido
  contentsSchema.parse(contents);
}
