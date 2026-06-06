/* Ficheiro de validação para a entidade Flight usando Zod.
   Garante que os dados recebidos para criar ou atualizar uma viagem estejam 
no formato correto e atendam às restrições da base de dados. */

import { z } from 'zod';

// Helper base para limpar espaços e converter strings vazias em null
const normalizedString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val));

// Definição do Objeto Base para podermos reutilizar no partial()
const flightFields = {
  trip_id: z
    .coerce.number({ invalid_type_error: "The field trip_id must be numeric." })
    .int({ message: "The field trip_id must be an integer." })
    .positive({ message: "The field trip_id must be a positive number." }),
    // coerce: tenta forçar a conversão do valor para número; se falhar, lança um erro de tipo inválido com a mensagem personalizada

  // Aplica a normalização primeiro, valida o tamanho máximo se houver texto, e permite null/undefined
  flight_number: normalizedString
    .pipe(z.string().max(25, { message: "The field flight_number cannot exceed 25 characters." }).nullable())
    .optional(),
    // "Pipe" de Transformação e Validação: O Zod recebe o input, remove os espaços vazios (normalizedString), converte strings vazias em null; O "pipe" recebe o valor limpo e verifica se ele cumpre a regra de ter no máximo 25 caracteres

  airline: normalizedString
    .pipe(z.string().max(100, { message: "The field airline cannot exceed 100 characters." }).nullable())
    .optional(),

  departure_airport: normalizedString
    .pipe(z.string().max(15, { message: "The field departure_airport cannot exceed 15 characters." }).nullable())
    .optional(),

  arrival_airport: normalizedString
    .pipe(z.string().max(15, { message: "The field arrival_airport cannot exceed 15 characters." }).nullable())
    .optional(),

  departure_datetime: z
    .string({ required_error: "The field departure_datetime is mandatory." })
    .datetime({ message: "The field departure_datetime must be a valid ISO date-time." }),

  arrival_datetime: z
    .string({ required_error: "The field arrival_datetime is mandatory." })
    .datetime({ message: "The field arrival_datetime must be a valid ISO date-time." }),
};

// Schema de Criação Completo com a validação cross-field
export const createFlightSchema = z.object(flightFields)
  .refine((data) => new Date(data.arrival_datetime) >= new Date(data.departure_datetime), {
    message: "Arrival datetime cannot be earlier than departure datetime.",
    path: ["arrival_datetime"], 
  });
  // refine: para criar uma regra de validação que não existe nativamente no Zod;
  // (data): objeto completo validado até agora; se a função retornar false, o Zod adiciona um erro de validação com a mensagem e o caminho especificados

// Schema de Atualização (Update / PATCH)
export const updateFlightSchema = z.object(flightFields).partial()
  // Garante que pelo menos um campo foi enviado para atualização
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please indicate at least one field to update.",
  })
  // Só valida a lógica das datas se AMBAS tiverem sido enviadas no PATCH
  .refine((data) => {
    if (!data.departure_datetime || !data.arrival_datetime) return true;
    return new Date(data.arrival_datetime) >= new Date(data.departure_datetime);
  }, {
    message: "Arrival datetime cannot be earlier than departure datetime.",
    path: ["arrival_datetime"],
  });

/* Este ficheiro pretende responder à pergunta:

"quais são as regras do Flight?"

Responsável por:
- regras da entidade
- mensagens de erro
- coerência de tipos e formatos entre campos */
