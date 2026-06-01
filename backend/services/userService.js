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

// Transforma o snake_case da BD para camelCase consistente no Frontend
function normalizeUser(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    surname: row.surname,
    email: row.email,
    mobilePhone: row.mobile_phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // não passamos passwordHash para o frontend por segurança
  };
}

// LISTA TODOS OS UTILIZADORES
export async function listUsers() {
  const users = await userRepository.listUsers();
  return users.map(normalizeUser);
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
  
  return normalizeUser(userRows[0]);
}

/// ATUALIZA UM USER EXISTENTE
export async function updateUser(id, validatedUser) {
  const userRows = await userRepository.findUserById(id);

  if (!userRows || userRows.length === 0) {
    throw new NotFoundError('User not found.');
  }

  // Se o utilizador estiver a tentar alterar o email, validamos se o novo email já pertence a outra pessoa
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
  return normalizeUser(updatedUserRows[0]);
}

// APAGA UM USER EXISTENTE
export async function deleteUser(id) {
  const userRows = await userRepository.findUserById(id);

  if (!userRows || userRows.length === 0) {
    throw new NotFoundError('User not found.');
  }

  await userRepository.deleteUser(id);
  return normalizeUser(userRows[0]);
}