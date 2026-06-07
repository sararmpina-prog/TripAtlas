/* Ficheiro de validação para a entidade User usando Zod.
   Garante que os dados recebidos para criar ou atualizar um utilizador estejam no formato correto e atendam às restrições da base de dados. */

import { z } from 'zod';
// IMPORTAÇÃO DOS HELPERS CENTRALIZADOS
import { createRequiredString, optionalNormalizedString } from '../utils/zodHelpers.js';

// SCHEMA DE CRIAÇÃO (POST / Registo)
// Todos os campos são obrigatórios por omissão no fluxo inicial
export const createUserSchema = z.object({
  first_name: createRequiredString('first_name')
    .min(1, { message: "The field first_name cannot be empty." })
    .max(100, { message: "The field first_name cannot exceed 100 characters." }),

  surname: createRequiredString('surname')
    .min(1, { message: "The field surname cannot be empty." })
    .max(100, { message: "The field surname cannot exceed 100 characters." }),

  email: createRequiredString('email')
    .email({ message: "The field email must be a valid email address." })
    .max(150, { message: "The field email cannot exceed 150 characters." }),

  mobile_phone: optionalNormalizedString
    .pipe(
      z.string()
        .max(20, { message: "The field mobile_phone cannot exceed 20 characters." })
        .regex(/^\+?[0-9\s]+$/, { message: "The field mobile_phone contains invalid characters." })
        .nullable()
    )
    .optional(),

  password: createRequiredString('password')
    .min(6, { message: "The field password must be at least 6 characters long." })
    .max(50, { message: "The field password cannot exceed 50 characters." }),
});

// SCHEMA DE ATUALIZAÇÃO (PATCH / Alterar Perfil)
// No PATCH, nenhum campo é obrigatório de enviar, mas se for enviado, tem de ser válido
export const updateUserSchema = z.object({
  first_name: z.string().trim().min(1, { message: "The field first_name cannot be empty." }).max(100).optional(),
  surname: z.string().trim().min(1, { message: "The field surname cannot be empty." }).max(100).optional(),
  
  email: z.string().trim().email({ message: "The field email must be a valid email address." }).max(150).optional(),
  
  mobile_phone: optionalNormalizedString
    .pipe(
      z.string()
        .max(20, { message: "The field mobile_phone cannot exceed 20 characters." })
        .regex(/^\+?[0-9\s]+$/, { message: "The field mobile_phone contains invalid characters." })
        .nullable()
    )
    .optional(),
  // Por questões de segurança, não se atualiza a password na mesma rota do perfil!!
})

// Garante que o corpo do PATCH não vai totalmente vazio
.refine((data) => Object.keys(data).length > 0, {
  message: "Please indicate at least one field to update.",
});

// ** SCHEMA EXCLUSIVO PARA ALTERAÇÃO DE PASSWORD **
export const updatePasswordSchema = z.object({
  current_password: createRequiredString('current_password')
    .min(1, { message: "The field current_password cannot be empty." }),

  new_password: createRequiredString('new_password')
    .min(6, { message: "The field new_password must be at least 6 characters long." })
    .max(50, { message: "The field new_password cannot exceed 50 characters." }),
})
// Regra extra: Garante que a nova password não é igual à antiga
.refine((data) => data.current_password !== data.new_password, {
  message: "The new_password cannot be the same as the current_password.",
  path: ["new_password"], // O erro será mapeado diretamente para o campo new_password
});