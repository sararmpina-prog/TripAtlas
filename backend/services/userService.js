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
import bcrypt from 'bcrypt';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/appErrors.js';

// LISTA TODOS OS UTILIZADORES
export async function listUsers(currentUserId) {
  const user = await userRepository.findUserById(currentUserId);

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  // Remove a password de todos os utilizadores da lista antes de enviar para o controller
  const { password_hash, ...safeUser } = user;
  return [safeUser];
}

// CRIA UM NOVO UTILIZADOR
export async function createUser(validatedUser) {
  const existingUser = await userRepository.findUserByEmail(validatedUser.email);
  if (existingUser) {
    throw new ValidationError('This email address is already registered.');
  }

  const hashedPassword = await bcrypt.hash(validatedUser.password, 10);

  const newUser = {
    ...validatedUser,
    password: hashedPassword,
  };

  const userId = await userRepository.createUser(newUser);
  const user = await userRepository.findUserById(userId);
  
  // Segurança: Garante que a password_hash não vaza para o cliente
  delete user.password_hash;
  return user;
}

// ATUALIZA UM USER EXISTENTE
export async function updateUser(id, currentUserId, validatedUser) {
  if (Number(id) !== Number(currentUserId)) {
    throw new ForbiddenError('You can only update your own user.');
  }

  const existingUser = await userRepository.findUserById(id);

  if (!existingUser) {
    throw new NotFoundError('User not found.');
  }

  if (validatedUser.email) {
    const userWithEmail = await userRepository.findUserByEmail(validatedUser.email);
    if (userWithEmail && userWithEmail.id !== Number(id)) {
      throw new ValidationError('This email address is already in use by another user.');
    }
  }

  const isUpdated = await userRepository.updateUser(id, validatedUser);

  if (!isUpdated) {
    throw new NotFoundError('User not found.');
  }

  const user = await userRepository.findUserById(id);
  
  delete user.password_hash;
  return user;
}

// ATUALIZA A PASSWORD DE UM USER EXISTENTE
// Atualiza a password de um utilizador de forma segura.
// @param {number} userId - ID do utilizador autenticado
// @param {object} payload - Contém current_password e new_password vindos do Zod

export async function updateUserPassword(userId, currentUserId, payload) {
  if (Number(userId) !== Number(currentUserId)) {
    throw new ForbiddenError('You can only update your own password.');
  }

  const { current_password, new_password } = payload;

  // Validar se o utilizador existe na Base de Dados
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  // Comparar a password atual enviada com o password_hash guardado na BD
  // O bcrypt.compare descodifica o hash antigo e valida a correspondência de segurança
  const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
  if (!isPasswordValid) {
    throw new ValidationError('Incorrect current password.');
  }

  // Gerar um salt e encriptar a nova password (padrão de 10 rands de segurança)
  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(new_password, salt);

  // Gravar o novo hash na base de dados através do repository em snake_case
  await userRepository.updateUserPasswordHash(userId, newPasswordHash);

  // Retorna uma mensagem de sucesso limpa (não deves expor dados confidenciais)
  return {
    message: 'Password updated successfully.'
  };
}


// APAGA UM USER EXISTENTE
export async function deleteUser(id, currentUserId) {
  if (Number(id) !== Number(currentUserId)) {
    throw new ForbiddenError('You can only delete your own user.');
  }

  const user = await userRepository.findUserById(id);

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  await userRepository.deleteUser(id);
  
  delete user.password_hash;
  return user;
}

/* Caminho dos erros no service:

- Service lança erros específicos (NotFoundError, ValidationError);
- asyncHandler no controller apanha esses erros (.catch(next)) e passa-os para a frente;
- appErrors define a identidade do erro (statusCode, message);
- errorHandler recebe o erro, lê as marcas de identidade que o appErrors definiu e responde ao utilizador com um formato JSON consistente e o código HTTP correto.
*/
