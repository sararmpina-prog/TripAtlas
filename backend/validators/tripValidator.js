/* Ficheiro de validação para a entidade Trip usando Zod. 
   Garante que os dados recebidos para criar ou atualizar uma viagem estejam 
no formato correto e atendam às restrições da base de dados. */

import { z } from 'zod';

// Helper base para limpar espaços e converter strings vazias em null
const normalizedString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val));

// Definição do Objeto Base mapeado estritamente com as restrições do SQL
const tripFields = {
  // valida a chave estrangeira do utilizador
  user_id: z
    .coerce.number({ invalid_type_error: "The field user_id must be numeric." })
    .int({ message: "The field user_id must be an integer." })
    .positive({ message: "The field user_id must be a positive number." }),
    // coerce: tenta forçar a conversão do valor para número; se falhar, lança um erro de tipo inválido com a mensagem personalizada

  title: z
    .string({ required_error: "The field title is mandatory." })
    .trim()
    .min(1, { message: "The field title cannot be empty." })
    .max(100, { message: "The field title cannot exceed 100 characters." }),

  description: normalizedString
    // Limitado a 1000 caracteres por regra de negócio, mantendo a compatibilidade com o TEXT do SQL
    .pipe(z.string().max(1000, { message: "The field description cannot exceed 1000 characters." }).nullable())
    .optional(),
    // "Pipe" de Transformação e Validação: O Zod recebe o input, remove os espaços vazios (normalizedString), converte strings vazias em null; O "pipe" recebe o valor limpo e verifica se ele cumpre a regra de ter no máximo 1000 caracteres

  destination: z
    .string({ required_error: "The field destination is mandatory." })
    .trim()
    .min(1, { message: "The field destination cannot be empty." })
    .max(150, { message: "The field destination cannot exceed 150 characters." }),

  start_date: z
    .string({ required_error: "The field start_date is mandatory." })
    .date({ message: "The field start_date must use the YYYY-MM-DD format." }),

  end_date: z
    .string({ required_error: "The field end_date is mandatory." })
    .date({ message: "The field end_date must use the YYYY-MM-DD format." }),
};

// Schema de Criação Completo (POST) com a validação cross-field cronológica
export const createTripSchema = z.object(tripFields)
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "The end date cannot be earlier than the start date.",
    path: ["end_date"], 
  });
  // refine: para criar uma regra de validação que não existe nativamente no Zod;
  // (data): objeto completo validado até agora; se a função retornar false, o Zod adiciona um erro de validação com a mensagem e o caminho especificados

// Schema de Atualização (PATCH)
export const updateTripSchema = z.object(tripFields).partial()
  // Garante que pelo menos um campo foi enviado para atualização
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please indicate at least one field to update.",
  })
  // CORREÇÃO: Se apenas uma data for enviada no PATCH, a validação cruzada contra os dados existentes deve ser feita no Controller/Service (consultando a BD). No Zod, apenas se valida se AMBAS vierem juntas.
  .refine((data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.end_date) >= new Date(data.start_date);
    }
    return true;
  }, {
    message: "The end date cannot be earlier than the start date.",
    path: ["end_date"],
  });

/* Este ficheiro pretende responder à pergunta:

"quais são as regras da Trip?"

Responsável por:
- regras da entidade (tamanhos VARCHAR da BD)
- mensagens de erro amigáveis
- coerência de tipos e formatos entre campos */
