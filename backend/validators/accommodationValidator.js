import { z } from 'zod';
// IMPORTAÇÃO DOS HELPERS CENTRALIZADOS
import { createRequiredString, optionalNormalizedString } from '../utils/zodHelpers.js';

// SCHEMA DE CRIAÇÃO (POST / Registo)
// Todos os campos são obrigatórios por omissão no fluxo inicial
export const createAccommodationSchema = z.object({
   name: createRequiredString("name", 150),
   address: createRequiredString("address", 255),
   city: createRequiredString("city", 100),
   country: createRequiredString("country", 100),
})
  .refine((data) => {
    if (data.name === '' || data.address === '' || data.city === '' || data.country === '') {
      return false; // Rejeita se name, city ou country forem strings vazias
    }
    return true;
  }, {
    message: "Fields name, address, city and country cannot be empty strings.",
  });

// SCHEMA DE ATUALIZAÇÃO (PATCH / Alterar)
// No PATCH, nenhum campo é obrigatório de enviar, mas se for enviado, tem de ser válido
export const updateAccommodationSchema = z.object({
  name: optionalNormalizedString
   .pipe(z.string().max(150, { message: "The field name cannot exceed 150 characters." }).nullable())
   .optional(),

  address: optionalNormalizedString
   .pipe(z.string().max(255, { message: "The field address cannot exceed 255 characters." }).nullable())
   .optional(),

  city: optionalNormalizedString
   .pipe(z.string().max(100, { message: "The field city cannot exceed 100 characters." }).nullable())
   .optional(),

  country: optionalNormalizedString
   .pipe(z.string().max(100, { message: "The field country cannot exceed 100 characters." }).nullable())
   .optional()
})
  // Garante que o corpo do PATCH não vai totalmente vazio
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please indicate at least one field to update.",
  })
  .refine((data) => {
    if (data.name === '' || data.address === '' || data.city === '' || data.country === '') {
      return false; // Rejeita se city ou country forem strings vazias
    }
    return true;
  }, {
    message: "Fields name, address, city and country cannot be empty strings.",
  });


/* Este ficheiro pretende responder à pergunta:

"quais são as regras da Accommodation?"

Responsável por:
- regras da entidade
- mensagens de erro
- coerência entre campos */