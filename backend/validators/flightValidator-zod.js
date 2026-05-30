/* Ficheiro de validação para a entidade Flight usando Zod. Ele define as regras de validação para os campos relacionados a um voo. Este arquivo é responsável por garantir que os dados recebidos para criar ou atualizar um voo estejam no formato correto e atendam às regras de negócio estabelecidas. */

import { z } from 'zod';

// Helper base para limpar espaços e converter strings vazias em null
const normalizedString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val));

// Definição do Objeto Base para podermos reutilizar no partial()
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
export const createFlightSchema = z.object(flightFields)
  .refine((data) => new Date(data.arrivalDatetime) >= new Date(data.departureDatetime), {
    message: "Arrival datetime cannot be earlier than departure datetime.",
    path: ["arrivalDatetime"], 
  });

// Schema de Atualização (Update / PATCH)
export const updateFlightSchema = z.object(flightFields).partial()
  // Garante que pelo menos um campo foi enviado para atualização
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please indicate at least one field to update.",
  })
  // Só valida a lógica das datas se AMBAS tiverem sido enviadas no PATCH
  .refine((data) => {
    if (!data.departureDatetime || !data.arrivalDatetime) return true;
    return new Date(data.arrivalDatetime) >= new Date(data.departureDatetime);
  }, {
    message: "Arrival datetime cannot be earlier than departure datetime.",
    path: ["arrivalDatetime"],
  });

/* Este ficheiro pretende responder à pergunta:

"quais são as regras do Flight?"

Responsável por:
- regras da entidade
- mensagens de erro
- coerência de tipos e formatos entre campos */
