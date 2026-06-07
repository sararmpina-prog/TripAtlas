/* Helpers globais dinâmicos para esquemas do Zod.
   Evita duplicação de código e gera mensagens de erro automatizadas em inglês com base no nome do campo. */

import { z } from 'zod';

// Cria um validador de texto obrigatório gerando a frase de erro automaticamente
// @param {string} fieldName - O nome do campo (ex: 'email', 'first_name')
export const createRequiredString = (fieldName) => {
  return z
    .string({ required_error: `The field ${fieldName} is mandatory.` })
    .trim()
    .min(1, { message: `The field ${fieldName} cannot be empty.` });
};
  // Para campos de texto opcionais na base de dados (ex: mobile_phone, description)
export const optionalNormalizedString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val))
  .nullable()
  .optional();