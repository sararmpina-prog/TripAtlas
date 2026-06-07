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
  first_name: createRequiredString('first_name').min(1),
  surname: createRequiredString('surname').min(1),
  email: createRequiredString('email').email(),
  mobile_phone: optionalNormalizedString, 
  password: createRequiredString('password').min(6),
});
