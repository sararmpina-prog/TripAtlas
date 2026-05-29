import { z } from 'zod';
import { ValidationError } from '../utils/appErrors.js';

// Helper base para limpar espaços e converter strings vazias em null
const normalizedString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val));

// Definição do Objeto Base (Sem Refines) para podermos reutilizar no partial()
const flightFields = {
  tripId: z
    .any()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && Number.isInteger(val), {
      message: "The field tripId must be numeric.",
    }),

  // Aplica a normalização primeiro, valida o tamanho máximo se houver texto, e permite null/undefined
  flightNumber: normalizedString
    .pipe(z.string().max(25, { message: "The field flightNumber cannot exceed 25 characters." }).nullable())
    .optional(),

  airline: normalizedString
    .pipe(z.string().max(100, { message: "The field airline cannot exceed 100 characters." }).nullable())
    .optional(),

  departureAirport: normalizedString
    .pipe(z.string().max(15, { message: "The field departureAirport cannot exceed 15 characters." }).nullable())
    .optional(),

  arrivalAirport: normalizedString
    .pipe(z.string().max(15, { message: "The field arrivalAirport cannot exceed 15 characters." }).nullable())
    .optional(),

  departureDatetime: z
    .string({ required_error: "The field departureDatetime is mandatory." })
    .datetime({ message: "The field departureDatetime must be a valid ISO date-time." }),

  arrivalDatetime: z
    .string({ required_error: "The field arrivalDatetime is mandatory." })
    .datetime({ message: "The field arrivalDatetime must be a valid ISO date-time." }),
};

// Schema de Criação Completo com a validação cross-field
const createFlightSchema = z.object(flightFields)
  .refine((data) => new Date(data.arrivalDatetime) >= new Date(data.departureDatetime), {
    message: "Arrival datetime cannot be earlier than departure datetime.",
    path: ["arrivalDatetime"], 
  });

// Schema de Atualização (Update / PATCH)
const updateFlightSchema = z.object(flightFields).partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please indicate at least one field to update.",
  })
  .refine((data) => {
    if (!data.departureDatetime || !data.arrivalDatetime) return true;
    return new Date(data.arrivalDatetime) >= new Date(data.departureDatetime);
  }, {
    message: "Arrival datetime cannot be earlier than departure datetime.",
    path: ["arrivalDatetime"],
  });

// Funções de Exportação com Tratamento de Erros Customizado
export function validateCreateFlight(payload) {
  try {
    return createFlightSchema.parse(payload);
  } catch (error) {
    handleZodError(error);
  }
}

export function validateUpdateFlight(payload) {
  try {
    return updateFlightSchema.parse(payload);
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

"quais são as regras do Flight?"

Responsável por:
- regras da entidade
- mensagens de erro
- coerência entre campos */
