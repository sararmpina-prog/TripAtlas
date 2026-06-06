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
    .min(1, { message: "The field name cannot be empty." }) // Corrigido de "title" para "name"
    .max(150, { message: "The field name cannot exceed 150 characters." }), // Alinhado com o VARCHAR(150) do SQL

   city: z
    .string({ required_error: "The field city is mandatory." })
    .trim()
    .min(1, { message: "The field city cannot be empty." })
    .max(100, { message: "The field city cannot exceed 100 characters." }), // Alinhado com o VARCHAR(100) do SQL

    country: z
    .string({ required_error: "The field country is mandatory." })
    .trim()
    .min(1, { message: "The field country cannot be empty." })
    .max(100, { message: "The field country cannot exceed 150 characters." }) // Alinhado com o VARCHAR(100) do SQL
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


/* Este ficheiro pretende responder à pergunta:

"quais são as regras da Accommodation?"

Responsável por:
- regras da entidade
- mensagens de erro
- coerência entre campos */