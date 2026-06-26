/* Função para mapear erros comuns do MySQL para mensagens de erro mais amigáveis;
   Evita que detalhes técnicos da base de dados sejam expostos diretamente ao frontend.
*/

import { z } from 'zod';
import { ValidationError } from "../../utils/appErrors.js";

const duplicateEntryFields = [
  {
    dbColumn: 'users.email',
    field: 'email',
    message: 'This email address is already registered.',
  },
  {
    dbColumn: 'users.mobile_phone',
    field: 'mobile_phone',
    message: 'This mobile phone number is already registered.',
  },
];

// Schema do Zod que mapeia a estrutura de erro esperada do driver mysql2
const mysqlErrorSchema = z.object({
  code: z.string(),
  errno: z.coerce.number().optional(), // coerce para garantir que mesmo se vier como string, seja tratado como número
  sqlState: z.string().optional(),
  message: z.string()
});

export function normalizeDBError(err, context = null) {
  const parsedError = mysqlErrorSchema.safeParse(err);

  if (!parsedError.success) {
    return err;
  }

  const dbError = parsedError.data;

  if (dbError.code === 'ER_DUP_ENTRY') {
    const duplicateField = duplicateEntryFields.find(
      ({ dbColumn }) => dbError.message.includes(dbColumn));
    
      const message = context || duplicateField?.message || 'Entry already exists with the same unique value.';

    return new ValidationError(
      message,
      duplicateField
        ? [{
            field: duplicateField.field,
            message,
          }]
        : undefined,
      'DUPLICATE_ENTRY'
    );
  }
  
  // FOREIGN KEY constraint (Ex: Inserir um voo com tripId que não existe)
  if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
    return new ValidationError('Invalid reference: The associated resource was not found.');
  }

  return err;
}

export const handleDBError = (err, context = null) => {
  throw normalizeDBError(err, context);
};
