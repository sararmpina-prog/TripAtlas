import { z } from 'zod';
import { ValidationError } from '../utils/appErrors.js';

// Helper reutilizável para campos de texto opcionais e normalizados
const optionalNormalizedString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val))
  .optional()
  .nullable();

// 1. Definição das Regras dos Campos (Mapeado com as restrições do SQL)
const reserveFields = {
  accommodation_id: z
    .any()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && Number.isInteger(val), {
      message: "The field accommodation_id must be numeric.",
    }),
    trip_id: z
    .any()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && Number.isInteger(val), {
      message: "The field trip_id must be numeric.",
    }),
    check_in_date: z
    .string({ required_error: "The field check_in_date is mandatory." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "The field check_in_date must use YYYY-MM-DD.",
    }),
    check_out_date: z
    .string({ required_error: "The field check_out_date is mandatory." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "The field check_out_date must use YYYY-MM-DD.",
    }),
}

// 2. Schema de Criação Completo (POST)
export const createReserveSchema = z.object(reserveFields)
  // Validação Cross-Field: data de fim não pode ser anterior à data de início
  .refine((data) => data.check_out_date >= data.check_in_date, {
    message: "The check_out_date cannot be earlier than the check_in_date.",
    path: ["check_out_date"],
  });

// 3. Schema de Atualização Completo (PATCH)
export const updateReserveSchema = z.object(reserveFields).partial()
  // Garante que pelo menos um campo foi enviado para atualização
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please indicate at least one field to update.",
  })
  // Validação Cross-Field condicional para o Update
  .refine((data) => {
    if (!data.check_in_date || !data.check_out_date) return true;
    return (data.check_out_date) >= (data.check_in_date);
  }, {
    message: "The check_out_date cannot be earlier than the check_in_date.",
    path: ["check_out_date"],
  });

// 4. Funções de Exportação
export function validateCreateTrip(payload) {
  try {
    return createReserveSchema.parse(payload);
  } catch (error) {
    handleZodError(error);
  }
}

export function validateUpdateTrip(payload) {
  try {
    return updateReserveSchema.parse(payload);
  } catch (error) {
    handleZodError(error);
  }
}

// Helper para converter os erros do Zod para ValidationError do projeto
function handleZodError(error) {
  if (error instanceof z.ZodError) {
    const firstError = error.errors[0];
    throw new ValidationError(firstError.message);
  }
  throw error;
}

/* Este ficheiro pretende responder à pergunta:

"quais são as regras da Trip?"

Responsável por:
- regras da entidade
- mensagens de erro
- coerência entre campos */