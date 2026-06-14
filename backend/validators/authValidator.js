/* Ficheiro de validação para o fluxo de Autenticação (Zod).
   Garante que os inputs de Login e Registo cumprem as regras do sistema. */

import { z } from 'zod';
// IMPORTAÇÃO DOS HELPERS CENTRALIZADOS
import { createRequiredString, optionalNormalizedString } from '../utils/zodHelpers.js';


// SCHEMA DE LOGIN (Apenas Email e Password)
export const loginSchema = z.object({
  // O Zod vai gerar automaticamente: "The field email is mandatory."
  email: createRequiredString('email')
    .email({ message: "The field email must be a valid email address." }),
    
  // O Zod vai gerar automaticamente: "The field password is mandatory."
  password: createRequiredString('password')
    .min(1, { message: "The field password cannot be empty." }),
});

export const registerSchema = z.object({
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
