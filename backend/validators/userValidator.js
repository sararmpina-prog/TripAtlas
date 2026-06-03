/* Ficheiro de validação para a entidade User usando Zod.
   Garante que os dados recebidos para criar ou atualizar um utilizador estejam 
   no formato correto e atendam às restrições da base de dados. */

import { z } from 'zod';

// Helper base para limpar espaços e converter strings vazias em null
const normalizedString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val));

// Definição do Objeto Base
const userFields = {
  firstName: z
    .string({ required_error: "The field firstName is mandatory." })
    .trim()
    .min(1, { message: "The field firstName cannot be empty." })
    .max(100, { message: "The field firstName cannot exceed 100 characters." }),

  surname: z
    .string({ required_error: "The field surname is mandatory." })
    .trim()
    .min(1, { message: "The field surname cannot be empty." })
    .max(100, { message: "The field surname cannot exceed 100 characters." }),

  email: z
    .string({ required_error: "The field email is mandatory." })
    .trim()
    .email({ message: "The field email must be a valid email address." }) // Validação de email nativa!
    .max(150, { message: "The field email cannot exceed 150 characters." }),

    mobilePhone: normalizedString
    .pipe(
      z.string()
        .max(20, { message: "The field mobilePhone cannot exceed 20 characters." })
        // Aceita apenas números, espaços opcionalmente e o sinal + no início
        .regex(/^\+?[0-9\s]+$/, { message: "The field mobilePhone contains invalid characters." })
        .nullable()
    )
    .optional(),
    // regex para validar o formato do número de telefone, permitindo um sinal de mais opcional no início, seguido por dígitos e espaços; se a string for vazia, é convertida para null, e o campo é opcional

  // Recebe a password limpa enviada pelo utilizador (será transformada em hash apenas no Service)
  password: z
    .string({ required_error: "The field password is mandatory." })
    .min(6, { message: "The field password must be at least 6 characters long." })
    .max(50, { message: "The field password cannot exceed 50 characters." }),
};

// Schema de Criação Completo (POST / Registo de conta)
export const createUserSchema = z.object(userFields);

// Schema de Atualização (PATCH / Alterar Perfil)
// O .partial() torna todos os campos opcionais automaticamente para atualizações parciais
export const updateUserSchema = z.object(userFields).partial()
  // Garante que pelo menos um campo foi enviado para atualização
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please indicate at least one field to update.",
  });

/* Este ficheiro pretende responder à pergunta:

"quais são as regras do User?"

Responsável por:
- regras da entidade (tamanhos VARCHAR e regras de email do SQL)
- mensagens de erro personalizadas
- coerência de tipos entre campos */
