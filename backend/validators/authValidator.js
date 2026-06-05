/* Ficheiro de validação para o fluxo de Autenticação (Zod).
   Garante que os inputs de Login e Registo cumprem as regras do sistema. */

import { z } from 'zod';

// Helper base para limpar espaços e converter strings vazias em null
const normalizedString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val));

// SCHEMA DE LOGIN (Apenas Email e Password)
export const loginSchema = z.object({
  email: z
    .string({ required_error: "The field email is mandatory." })
    .trim()
    .email({ message: "The field email must be a valid email address." }),
    
  password: z
    .string({ required_error: "The field password is mandatory." })
    .min(1, { message: "The field password cannot be empty." }),
});

// SCHEMA DE REGISTO (Reutiliza as regras de negócio em snake_case)
export const registerSchema = z.object({
  first_name: z
    .string({ required_error: "The field first_name is mandatory." })
    .trim()
    .min(1, { message: "The field first_name cannot be empty." })
    .max(100, { message: "The field first_name cannot exceed 100 characters." }),

  surname: z
    .string({ required_error: "The field surname is mandatory." })
    .trim()
    .min(1, { message: "The field surname cannot be empty." })
    .max(100, { message: "The field surname cannot exceed 100 characters." }),

  email: z
    .string({ required_error: "The field email is mandatory." })
    .trim()
    .email({ message: "The field email must be a valid email address." })
    .max(150, { message: "The field email cannot exceed 150 characters." }),

  mobile_phone: normalizedString
    .pipe(
      z.string()
        .max(20, { message: "The field mobile_phone cannot exceed 20 characters." })
        .regex(/^\+?[0-9\s]+$/, { message: "The field mobile_phone contains invalid characters." })
        .nullable()
    )
    .optional(),

  password: z
    .string({ required_error: "The field password is mandatory." })
    .min(6, { message: "The field password must be at least 6 characters long." })
    .max(50, { message: "The field password cannot exceed 50 characters." }),
});
