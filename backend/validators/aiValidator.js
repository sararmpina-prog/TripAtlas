/* Ficheiro de validação para os inputs da API de Inteligência Artificial usando Zod.
   Protege o servidor contra payloads inválidos ou vazios vindos do Frontend. */

import { z } from 'zod';

export const chatMessageSchema = z.object({
  user_message: z
    .string({ required_error: "The field user_message is mandatory." })
    .trim()
    .min(1, { message: "The field user_message cannot be empty." })
    // Limite de 2000 caracteres evita que abusem do vosso chat enviando textos gigantescos
    .max(2000, { message: "The field user_message cannot exceed 2000 characters." }),

  chat_id: z.string().uuid().optional().nullable(),

  trip_id: z.number().optional().nullable(),
});
