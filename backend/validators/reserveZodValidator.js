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
  userId: z
    .any()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && Number.isInteger(val), {
      message: "The field userId must be numeric.",
    }),

  title: z
    .string({ required_error: "The field title is mandatory." })
    .trim()
    .min(1, { message: "The field title cannot be empty." })
    .max(100, { message: "The field title cannot exceed 100 characters." }),

  description: optionalNormalizedString
    .pipe(z.string().max(255, { message: "The field description cannot exceed 255 characters." }).nullable()),

  destination: z
    .string({ required_error: "The field destination is mandatory." })
    .trim()
    .min(1, { message: "The field destination cannot be empty." })
    .max(150, { message: "The field destination cannot exceed 150 characters." }),

  startDate: z
    .string({ required_error: "The field startDate is mandatory." })
    .date({ message: "The field startDate must use YYYY-MM-DD." }),

  endDate: z
    .string({ required_error: "The field endDate is mandatory." })
    .date({ message: "The field endDate must use YYYY-MM-DD." }),
};

// 2. Schema de Criação Completo (POST)
const createTripSchema = z.object(tripFields)
  // Validação Cross-Field: data de fim não pode ser anterior à data de início
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "The end date cannot be earlier than the start date.",
    path: ["endDate"],
  });

// 3. Schema de Atualização Completo (PATCH)
const updateTripSchema = z.object(tripFields).partial()
  // Garante que pelo menos um campo foi enviado para atualização
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please indicate at least one field to update.",
  })
  // Validação Cross-Field condicional para o Update
  .refine((data) => {
    if (!data.startDate || !data.endDate) return true;
    return new Date(data.endDate) >= new Date(data.startDate);
  }, {
    message: "The end date cannot be earlier than the start date.",
    path: ["endDate"],
  });

// 4. Funções de Exportação
export function validateCreateTrip(payload) {
  try {
    return createTripSchema.parse(payload);
  } catch (error) {
    handleZodError(error);
  }
}

export function validateUpdateTrip(payload) {
  try {
    return updateTripSchema.parse(payload);
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