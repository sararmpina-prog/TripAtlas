/* Service:
Faz a ponte entre controllers / tool calls e a persistência, mantendo aqui:
- resolução de targets
- validação de regras de negócio
- normalização de input/output

Fluxo arquitetural:
Controller (recebe request/resposta HTTP)
   ↓
Service (decide regras de negócio)
   ↓
Database (armazenamento persistente)

Nota importante:
  A AI nunca acede diretamente à base de dados.
  Apenas chama funções expostas por este service.
*/

import * as userRepository from '../repository/userRepository.js';
import { NotFoundError, ValidationError } from '../utils/appErrors.js';

// LISTA TODOS OS UTILIZADORES
export async function listUsers() {
   return await userRepository.listUsers(); // Retorna diretamente o array em snake_case da BD

  // Remove a password de todos os utilizadores da lista antes de enviar para o controller
  return users.map(user => {
    delete user.password_hash;
    return user;
  });
}

// CRIA UM NOVO UTILIZADOR
export async function createUser(validatedUser) {
  const existingUser = await userRepository.findUserByEmail(validatedUser.email);
  if (existingUser && existingUser.length > 0) {
    throw new ValidationError('This email address is already registered.');
  }

  // Nota para terça-feira: É aqui, mesmo antes de enviar para o repository, 
  // que vamos encriptar a password com bcrypt.hash() após a aula do professor.

  const userId = await userRepository.createUser(validatedUser);
  const userRows = await userRepository.findUserById(userId);
  const user = userRows[0];
  
  // Segurança: Garante que a password_hash não vaza para o cliente
  delete user.password_hash;
  return user;
}

// ATUALIZA UM USER EXISTENTE
export async function updateUser(id, validatedUser) {
  const userRows = await userRepository.findUserById(id);

  if (!userRows || userRows.length === 0) {
    throw new NotFoundError('User not found.');
  }

  if (validatedUser.email) {
    const emailRows = await userRepository.findUserByEmail(validatedUser.email);
    if (emailRows && emailRows.length > 0 && emailRows[0].id !== Number(id)) {
      throw new ValidationError('This email address is already in use by another user.');
    }
  }

  const isUpdated = await userRepository.updateUser(id, validatedUser);

  if (!isUpdated) {
    throw new NotFoundError('User not found.');
  }

  const updatedUserRows = await userRepository.findUserById(id);
  const user = updatedUserRows[0];
  
  delete user.password_hash;
  return user;
}

// APAGA UM USER EXISTENTE
export async function deleteUser(id) {
  const userRows = await userRepository.findUserById(id);

  if (!userRows || userRows.length === 0) {
    throw new NotFoundError('User not found.');
  }

  await userRepository.deleteUser(id);
  const user = userRows[0];
  
  delete user.password_hash;
  return user;
}

/* Caminho dos erros no service:

- Service lança erros específicos (NotFoundError, ValidationError);
- asyncHandler no controller apanha esses erros (.catch(next)) e passa-os para a frente;
- appErrors define a identidade do erro (statusCode, message);
- errorHandler recebe o erro, lê as marcas de identidade que o appErrors definiu e responde ao utilizador com um formato JSON consistente e o código HTTP correto.
*/
