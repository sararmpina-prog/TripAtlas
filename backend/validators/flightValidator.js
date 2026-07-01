/* Ficheiro de validação para a entidade Flight usando Zod.
   Garante que os dados recebidos para criar ou atualizar uma viagem estejam 
no formato correto e atendam às restrições da base de dados. */

import { z } from 'zod';
import { optionalNormalizedString } from '../utils/zodHelpers.js';

// REGEX GLOBAIS REUTILIZÁVEIS:

// Alfanumérico (letras e números), sem espaços: ex: TP123, FR3922
const FLIGHT_NUMBER_REGEX = /^[A-Za-z0-9]+$/; 

// Apenas letras e espaços (inclui acentos e cedilhas para nomes como "SATA Air Açores")
const AIRLINE_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

// SCHEMA DE CRIAÇÃO (POST / Registo)
export const createFlightSchema = z.object({
  trip_id: z
    .coerce.number({ invalid_type_error: "The field trip_id must be numeric." })
    .int({ message: "The field trip_id must be an integer." })
    .positive({ message: "The field trip_id must be a positive number." }),

  direction: z
    .enum(['outbound', 'return'], {
      errorMap: () => ({ message: 'The field direction must be either outbound or return.' }),
    }),

  flight_number: optionalNormalizedString
    .pipe(
      z.string()
        .max(25, { message: "The field flight_number cannot exceed 25 characters." })
        /* Apenas letras e números, sem espaços */
        .regex(FLIGHT_NUMBER_REGEX, { message: "The flight number must contain only letters and numbers (no spaces)." })
        .nullable()
    )
    .optional(),

  airline: optionalNormalizedString
    .pipe(
      z.string()
        .max(100, { message: "The field airline cannot exceed 100 characters." })
        /* Apenas letras e espaços */
        .regex(AIRLINE_REGEX, { message: "The airline name must contain only letters." })
        .nullable()
    )
    .optional(),

  departure_airport: optionalNormalizedString
    .pipe(z.string().max(15, { message: "The field departure_airport cannot exceed 15 characters." }).nullable())
    .optional(),

  arrival_airport: optionalNormalizedString
    .pipe(z.string().max(15, { message: "The field arrival_airport cannot exceed 15 characters." }).nullable())
    .optional(),

  departure_datetime: z
    .string({ required_error: "The field departure_datetime is mandatory." })
    .datetime({ message: "The field departure_datetime must be a valid ISO date-time." }),

  arrival_datetime: z
    .string({ required_error: "The field arrival_datetime is mandatory." })
    .datetime({ message: "The field arrival_datetime must be a valid ISO date-time." }),
})
  .refine((data) => new Date(data.arrival_datetime) >= new Date(data.departure_datetime), {
    message: "Arrival datetime cannot be earlier than departure datetime.",
    path: ["arrival_datetime"],
});
  

// SCHEMA DE ATUALIZAÇÃO (PATCH / Alterar)
export const updateFlightSchema = z.object({
  trip_id: z
    .coerce.number({ invalid_type_error: "The field trip_id must be numeric." })
    .int({ message: "The field trip_id must be an integer." })
    .positive({ message: "The field trip_id must be a positive number." })
    .optional(),
  direction: z
    .enum(['outbound', 'return'], {
      errorMap: () => ({ message: 'The field direction must be either outbound or return.' }),
    })
    .optional(),
  flight_number: optionalNormalizedString
    .pipe(
      z.string()
        .max(25, { message: "The field flight_number cannot exceed 25 characters." })
        .regex(FLIGHT_NUMBER_REGEX, { message: "The flight number must contain only letters and numbers (no spaces)." })
        .nullable()
    )
    .optional(),
  airline: optionalNormalizedString
    .pipe(
      z.string()
        .max(100, { message: "The field airline cannot exceed 100 characters." })
        .regex(AIRLINE_REGEX, { message: "The airline name must contain only letters." })
        .nullable()
    )
    .optional(),
  departure_airport: optionalNormalizedString
    .pipe(z.string().max(15, { message: "The field departure_airport cannot exceed 15 characters." }).nullable())
    .optional(),
  arrival_airport: optionalNormalizedString
    .pipe(z.string().max(15, { message: "The field arrival_airport cannot exceed 15 characters." }).nullable())
    .optional(),
  departure_datetime: z
    .string({ required_error: "The field departure_datetime is mandatory." })
    .datetime({ message: "The field departure_datetime must be a valid ISO date-time." })
    .optional(),
  arrival_datetime: z
    .string({ required_error: "The field arrival_datetime is mandatory." })
    .datetime({ message: "The field arrival_datetime must be a valid ISO date-time." })
    .optional(),
})
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please indicate at least one field to update.",
  })
  .refine((data) => {
    if (!data.departure_datetime || !data.arrival_datetime) return true;
    return new Date(data.arrival_datetime) >= new Date(data.departure_datetime);
  }, {
    message: "Arrival datetime cannot be earlier than departure datetime.",
    path: ["arrival_datetime"],
  });
