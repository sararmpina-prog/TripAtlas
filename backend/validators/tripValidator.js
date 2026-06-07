/* Ficheiro de validação para a entidade Trip usando Zod. 
   Garante que os dados recebidos para criar ou atualizar uma viagem estejam 
no formato correto e atendam às restrições da base de dados. */

import { z } from 'zod';
// IMPORTAÇÃO DOS HELPERS CENTRALIZADOS
import { createRequiredString, optionalNormalizedString } from '../utils/zodHelpers.js';

// SCHEMA DE CRIAÇÃO (POST / Registo)
// Todos os campos são obrigatórios por omissão no fluxo inicial
export const createTripSchema = z.object({
  user_id: z
    .coerce.number({ invalid_type_error: "The field user_id must be numeric." })
    .int({ message: "The field user_id must be an integer." })
    .positive({ message: "The field user_id must be a positive number." }),
  title: createRequiredString('title')
    .min(1, { message: "The field title cannot be empty." })
    .max(100, { message: "The field title cannot exceed 100 characters." }),
  description: optionalNormalizedString
    .pipe(z.string().max(1000, { message: "The field description cannot exceed 1000 characters." }).nullable())
    .optional(),
  destination: createRequiredString('destination')
    .min(1, { message: "The field destination cannot be empty." })
    .max(150, { message: "The field destination cannot exceed 150 characters." }),
  start_date: z
    .string({ required_error: "The field start_date is mandatory." })
    .date({ message: "The field start_date must use the YYYY-MM-DD format." }),
  end_date: z
    .string({ required_error: "The field end_date is mandatory." })
    .date({ message: "The field end_date must use the YYYY-MM-DD format." }),
})
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: "The end_date cannot be earlier than the start_date.",
  path: ["end_date"], 
});

// SCHEMA DE ATUALIZAÇÃO (PATCH / Alterar Perfil)
// No PATCH, nenhum campo é obrigatório de enviar, mas se for enviado, tem de ser válido
export const updateTripSchema = z.object({
  user_id: z
    .coerce.number({ invalid_type_error: "The field user_id must be numeric." })
    .int({ message: "The field user_id must be an integer." })
    .positive({ message: "The field user_id must be a positive number." })
    .optional(),
  title: z.string().trim().min(1, { message: "The field title cannot be empty." }).max(100).optional(),
  description: optionalNormalizedString
    .pipe(z.string().max(1000, { message: "The field description cannot exceed 1000 characters." }).nullable())
    .optional(),
  destination: z.string().trim().min(1, { message: "The field destination cannot be empty." }).max(150).optional(),
  start_date: z.string().date({ message: "The field start_date must use the YYYY-MM-DD format." }).optional(),
  end_date: z.string().date({ message: "The field end_date must use the YYYY-MM-DD format." }).optional(),
})
// Garante que o corpo do PATCH não vai totalmente vazio
.refine((data) => Object.keys(data).length > 0, {
  message: "Please indicate at least one field to update.",
})
// Se apenas uma data for enviada no PATCH, a validação cruzada contra os dados existentes deve ser feita no Controller/Service (consultando a BD). No Zod, apenas se valida se AMBAS vierem juntas.
.refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: "The end_date cannot be earlier than the start_date.",
  path: ["end_date"],
}); 

/* Este ficheiro pretende responder à pergunta:

"quais são as regras da Trip?"

Responsável por:
- regras da entidade (tamanhos VARCHAR da BD)
- mensagens de erro amigáveis
- coerência de tipos e formatos entre campos */
