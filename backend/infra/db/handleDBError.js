
/*
Função para mapear erros comuns do MySQL para mensagens de erro mais amigáveis;
Evita que erros da data base sejam expostos diretamente ao frontend.
Pode ser usada nos services para garantir que os erros sejam tratados adequadamente.
*/

import { ValidationError } from "../../utils/appErrors.js";

export const handleDBError = (err, context = null) => {
  // UNIQUE constraint
  if (err.code === "ER_DUP_ENTRY") {
    const message = context || "Entry already exists with the same unique value";
    throw new ValidationError(message);
  }

  // FOREIGN KEY constraint
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    throw new ValidationError("Invalid reference in another table");
  }
  // Errors that aren't mapped are re-thrown
  throw err;
};
