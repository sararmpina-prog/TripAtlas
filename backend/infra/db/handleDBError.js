/* Função para mapear erros comuns do MySQL para mensagens de erro mais amigáveis;
   Evita que detalhes técnicos da base de dados sejam expostos diretamente ao frontend.
*/

import { z } from 'zod';
import { ValidationError } from "../../utils/appErrors.js";

// Schema do Zod que mapeia a estrutura de erro esperada do driver mysql2
const mysqlErrorSchema = z.object({
  code: z.string(),
  errno: z.coerce.number().optional(),
  sqlState: z.string().optional(),
  message: z.string()
});

export const handleDBError = (err, context = null) => {
  // Executa um parsing seguro. Se for um erro estruturado do MySQL, tratamos.
  const parsedError = mysqlErrorSchema.safeParse(err);

  if (parsedError.success) {
    const dbError = parsedError.data;

    // UNIQUE constraint (Ex: Email duplicado)
    if (dbError.code === "ER_DUP_ENTRY") {
      const message = context || "Entry already exists with the same unique value.";
      throw new ValidationError(message);
    }

    // FOREIGN KEY constraint (Ex: Inserir um voo com tripId que não existe)
    if (dbError.code === "ER_NO_REFERENCED_ROW_2") {
      throw new ValidationError("Invalid reference: The associated resource was not found.");
    }
  }

  // Se for um erro desconhecido ou não mapeado, reatira o erro para o errorHandler global
  throw err;
};
