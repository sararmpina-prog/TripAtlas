/* Ficheiro de validação para os inputs da API de Inteligência Artificial usando Zod.
   Protege o servidor contra payloads inválidos ou vazios vindos do Frontend. */

import { z } from 'zod';

// Lista defensiva de palavras-chave utilizadas em ataques de Prompt Injection / Jailbreak
const JAILBREAK_KEYWORDS = [
  "ignore previous instructions", 
  "ignore all rules", 
  "system prompt", 
  "jailbreak",
  "act as a malicious"
];

export const chatMessageSchema = z.object({
  user_message: z
    .string({ required_error: "The field user_message is mandatory." })
    .trim()
    .min(1, { message: "The field user_message cannot be empty." })
    // Limite de 2000 caracteres evita que abusem do chat assistant enviando textos gigantescos
    .max(2000, { message: "The field user_message cannot exceed 2000 characters." }),

  chat_id: z.string().uuid().optional().nullable(),

  trip_id: z.number().optional().nullable(),
}).refine((data) => {
  // Defesa activa: Converte o texto para minúsculas e procura tentativas de subversão
  const lowerMessage = data.user_message.toLowerCase();
  const isMalicious = JAILBREAK_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  
  // Se contiver palavras perigosas, o Zod falha a validação automaticamente
  return !isMalicious;
}, {
  message: "Security warning: System instruction override attempts are strictly forbidden.",
  path: ["user_message"] // Amarra o erro diretamente ao campo de texto para a UI ler
});
