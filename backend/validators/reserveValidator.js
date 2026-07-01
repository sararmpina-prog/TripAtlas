import { z } from 'zod';
// IMPORTAÇÃO DOS HELPERS CENTRALIZADOS
import { createRequiredString, optionalNormalizedString } from '../utils/zodHelpers.js';

// SCHEMA DE CRIAÇÃO (POST / Registo)
// Todos os campos são obrigatórios por omissão no fluxo inicial
export const createReserveSchema = z.object({
  accommodation_id: z
    .coerce.number({ invalid_type_error: "The field accommodation_id must be numeric." })
    .int({ message: "The field accommodation_id must be an integer." })
    .positive({ message: "The field accommodation_id must be a positive number." }),
  trip_id: z
    .coerce.number({ invalid_type_error: "The field trip_id must be numeric." })
    .int({ message: "The field trip_id must be an integer." })
    .positive({ message: "The field trip_id must be a positive number." }),
  check_in_date: z
    .string({ required_error: "The field check_in_date is mandatory." })
    .date({ message: "The field check_in_date must use the YYYY-MM-DD format." }),
  check_out_date: z
    .string({ required_error: "The field check_out_date is mandatory." })
    .date({ message: "The field check_out_date must use the YYYY-MM-DD format." }),
})
// Validação Cross-Field: data de fim não pode ser anterior à data de início
.refine((data) => data.check_out_date >= data.check_in_date, {
  message: "The check_out_date cannot be earlier than the check_in_date.",
});

// SCHEMA DE ATUALIZAÇÃO (PATCH / Alterar Perfil)
// No PATCH, nenhum campo é obrigatório de enviar, mas se for enviado, tem de ser válido
export const updateReserveSchema = z.object({
  accommodation_id: z
    .coerce.number({ invalid_type_error: "The field accommodation_id must be numeric." })
    .int({ message: "The field accommodation_id must be an integer." })
    .positive({ message: "The field accommodation_id must be a positive number." })
    .optional(),
  trip_id: z
    .coerce.number({ invalid_type_error: "The field trip_id must be numeric." })
    .int({ message: "The field trip_id must be an integer." })
    .positive({ message: "The field trip_id must be a positive number." })
    .optional(),
  check_in_date: z
    .string()
    .date({ message: "The field check_in_date must use the YYYY-MM-DD format." })
    .optional(),
  check_out_date: z
    .string()
    .date({ message: "The field check_out_date must use the YYYY-MM-DD format." })
    .optional(),
})
// Garante que o corpo do PATCH não vai totalmente vazio
.refine((data) => Object.keys(data).length > 0, {
  message: "Please indicate at least one field to update.",
})
// Validação Cross-Field condicional para o Update
.refine((data) => {
  if (!data.check_in_date || !data.check_out_date) return true;
  return data.check_out_date >= data.check_in_date;
}, {
  message: "The check_out_date cannot be earlier than the check_in_date.",
});

/* Este ficheiro pretende responder à pergunta:

"quais são as regras da Reserve?"

Responsável por:
- regras da entidade
- mensagens de erro
- coerência entre campos */