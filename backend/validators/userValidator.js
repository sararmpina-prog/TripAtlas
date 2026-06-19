/* Ficheiro de validação para a entidade User usando Zod.
   Garante que os dados recebidos para criar ou atualizar um utilizador estejam no formato correto e atendam às restrições da base de dados. */

import { z } from 'zod';
// IMPORTAÇÃO DOS HELPERS CENTRALIZADOS
import { createRequiredString, optionalNormalizedString } from '../utils/zodHelpers.js';

const namePattern = /^[A-Za-zÀ-ÿ\s'-]+$/;
const phonePattern = /^\+?[0-9\s]+$/;
const specialCharacterPattern = /[^A-Za-z0-9]/;

// SCHEMA DE CRIAÇÃO (POST / Registo)
// Todos os campos são obrigatórios por omissão no fluxo inicial
export const createUserSchema = z.object({
  first_name: createRequiredString('first_name')
    .min(2, { message: 'The field first_name must have at least 2 letters.' })
    .max(100, { message: 'The field first_name cannot exceed 100 characters.' })
    .regex(namePattern, {
      message: 'First name can only contain letters.',
    }),

  surname: createRequiredString('surname')
    .min(2, { message: 'The field surname must have at least 2 letters.' })
    .max(100, { message: 'The field surname cannot exceed 100 characters.' })
    .regex(namePattern, {
      message: 'Surname can only contain letters.',
    }),

  email: createRequiredString('email')
    .email({ message: "The field email must be a valid email address." })
    .max(150, { message: "The field email cannot exceed 150 characters." }),

  mobile_phone: optionalNormalizedString
    .pipe(
      z.string()
        .max(20, { message: 'The field mobile_phone cannot exceed 20 characters.' })
        .regex(phonePattern, { message: 'The field mobile_phone contains invalid characters.' })
        .refine((value) => value.replace(/\D/g, '').length >= 9, {
          message: 'The field mobile_phone must contain at least 9 digits.',
        })
        .nullable()
    )
    .optional(),

  password: createRequiredString('password')
    .min(6, { message: "Password must include at least 6 characters and no more than 20 characters." })
    .max(20, { message: "Password must include at least 6 characters and no more than 20 characters." })
    .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter."
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter."
  })
  .regex(/[0-9]/, {
    message: "Password must contain at least one number."
  })
  .regex(specialCharacterPattern, {
      message: 'Password must contain at least one special character.',
    }),
});



// SCHEMA DE ATUALIZAÇÃO (PATCH / Alterar Perfil)
// No PATCH, nenhum campo é obrigatório de enviar, mas se for enviado, tem de ser válido
export const updateUserSchema = z.object({
  first_name: z.string()
    .trim()
    .min(2, { message: 'The field first_name must have at least 2 letters.' })
    .max(100, { message: 'The field first_name cannot exceed 100 characters.' })
    .regex(namePattern, {
      message: 'First name can only contain letters.',
    })
    .optional(),
  surname: z.string()
    .trim()
    .min(2, { message: 'The field surname must have at least 2 letters.' })
    .max(100, { message: 'The field surname cannot exceed 100 characters.' })
    .regex(namePattern, {
      message: 'Surname can only contain letters.',
    })
    .optional(),
  
  email: z.string().trim().email({ message: "The field email must be a valid email address." }).max(150).optional(),
  
  mobile_phone: optionalNormalizedString
    .pipe(
      z.string()
        .max(20, { message: 'The field mobile_phone cannot exceed 20 characters.' })
        .regex(phonePattern, { message: 'The field mobile_phone contains invalid characters.' })
        .refine((value) => value.replace(/\D/g, '').length >= 9, {
          message: 'The field mobile_phone must contain at least 9 digits.',
        })
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
    .min(6, { message: 'Password must include at least 6 characters and no more than 20 characters.' })
    .max(20, { message: 'Password must include at least 6 characters and no more than 20 characters.' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter.',
    })
    .regex(/[0-9]/, {
      message: 'Password must contain at least one number.',
    })
    .regex(specialCharacterPattern, {
      message: 'Password must contain at least one special character.',
    }),
})
// Regra extra: Garante que a nova password não é igual à antiga
.refine((data) => data.current_password !== data.new_password, {
  message: "The new_password cannot be the same as the current_password.",
  path: ["new_password"], // O erro será mapeado diretamente para o campo new_password
});