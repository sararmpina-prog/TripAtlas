import { z } from 'zod';
// IMPORTAÇÃO DOS HELPERS CENTRALIZADOS
import { createRequiredString, optionalNormalizedString } from '../utils/zodHelpers.js';

// SCHEMA DE CRIAÇÃO (POST / Registo)
// Todos os campos são obrigatórios por omissão no fluxo inicial
export const createReserveSchema = z.object({
  accommodation_id: z
    .coerce.number({ invalid_type_error: "The field accommodation_id must be numeric." })
    .int({ message: "The field accommodation_id must be an integer." })
    .positive({ message: "The field accommodation_id must be a positive number." })
    .optional(),
  trip_id: z
    .coerce.number({ invalid_type_error: "The field trip_id must be numeric." })
    .int({ message: "The field trip_id must be an integer." })
    .positive({ message: "The field trip_id must be a positive number." }),
  name: z.string().trim().max(150, { message: "The field name cannot exceed 150 characters." }).optional(),
  address: z.string().trim().max(255, { message: "The field address cannot exceed 255 characters." }).optional(),
  city: z.string().trim().max(100, { message: "The field city cannot exceed 100 characters." }).optional().nullable(),
  country: z.string().trim().max(100, { message: "The field country cannot exceed 100 characters." }).optional().nullable(),
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
})
.superRefine((data, ctx) => {
  // Permite dois fluxos: usar accommodation_id existente OU criar accommodation nova com nome+morada.
  if (data.accommodation_id !== undefined) return;

  if (!data.name || data.name.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['name'],
      message: "The field name is mandatory when accommodation_id is not provided.",
    });
  }

  if (!data.address || data.address.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['address'],
      message: "The field address is mandatory when accommodation_id is not provided.",
    });
  }
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