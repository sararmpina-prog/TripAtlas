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
const accommodationFields = {
   name: z
    .string({ required_error: "The field name is mandatory." })
    .trim()
    .min(1, { message: "The field title cannot be empty." })
    .max(100, { message: "The field title cannot exceed 150 characters." }),

   city: z
    .string({ required_error: "The field city is mandatory." })
    .trim()
    .min(1, { message: "The field city cannot be empty." })
    .max(100, { message: "The field city cannot exceed 150 characters." }),

    country: z
    .string({ required_error: "The field country is mandatory." })
    .trim()
    .min(1, { message: "The field country cannot be empty." })
    .max(100, { message: "The field country cannot exceed 150 characters." })
}

// 2. Schema de Criação Completo (POST)
export const createAccommodationSchema = z.object(accommodationFields);

// Schema de Atualização (PATCH / Alterar Perfil)
// O .partial() torna todos os campos opcionais automaticamente para atualizações parciais
export const updateAccommodationSchema = z.object(accommodationFields).partial()
  // Garante que pelo menos um campo foi enviado para atualização
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please indicate at least one field to update.",
  });

// 4. Funções de Exportação
export function validateCreateAccommodation(payload) {
  try {
    return createReserveSchema.parse(payload);
  } catch (error) {
    handleZodError(error);
  }
}

export function validateUpdateAccommodation(payload) {
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