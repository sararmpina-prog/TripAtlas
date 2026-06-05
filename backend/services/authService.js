/* Service de Autenticação:
   Centraliza a lógica de negócio para verificação de credenciais,
   encriptação de passwords e emissão de tokens de segurança.
*/

import bcrypt from 'bcrypt';
import * as userRepository from '../repository/userRepository.js';
import { ValidationError, NotFoundError } from '../utils/appErrors.js';
import { generateToken } from '../utils/jwtUtils.js';

// Autentica um utilizador no sistema
// @param {string} email - Email enviado no login
// @param {string} password - Password em texto limpo enviada no login
// @returns {object} Objeto contendo o token JWT e os dados do utilizador

// AUTENTICAÇÃO DE UTILIZADOR
export async function authenticateUser(email, password) {
  // Validação básica de presença de dados
  if (!email || !password) {
    throw new ValidationError('Email and password are required fields.');
  }

  // Procura o utilizador na base de dados através do repositório
  const userRows = await userRepository.findUserByEmail(email);

  // Como o MySQL devolve sempre um array, validamos se encontrou alguma linha
  if (!userRows || userRows.length === 0) {
    throw new ValidationError('Invalid email or password.'); 
    // Nota de segurança: Usar sempre uma mensagem genérica para não dar pistas a hackers
  }

  const user = userRows[0];

  // Compara a password em texto limpo com a password_hash gravada na BD
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new ValidationError('Invalid email or password.');
  }

  // Cria o Token JWT através do jwtUtils.js, usando o ID do utilizador como payload
  const token = generateToken(user.id);

  // Retorna os dados em snake_case puro para o controller responder
  return {
    token,
    user: {
      id: user.id,
      first_name: user.first_name,
      surname: user.surname,
      email: user.email,
      mobile_phone: user.mobile_phone
    }
  };
}


// REGISTA UM NOVO UTILIZADOR
/**
 * Regista um novo utilizador no sistema com password encriptada
 * @param {object} validatedData - Dados do utilizador vindos do validator (Zod)
 * @returns {object} Objeto com o token JWT e dados do utilizador criado
 */
export async function registerUser(validatedData) {
  console.log("service", validatedData)
  // 1. Verifica se o email já existe no sistema
  const existingUser = await userRepository.findUserByEmail(validatedData.email);
  if (existingUser && existingUser.length > 0) {
    throw new ValidationError('This email address is already registered.');
  }

  // 2. Encripta a password em texto limpo antes de ir para a BD
  // O número 10 indica o custo do algoritmo (saltRounds), o padrão de mercado seguro
  const hashedPassword = await bcrypt.hash(validatedData.password_hash, 10);

  // 3. Prepara o objeto substituto em snake_case puro para o repositório
  const newUserRows = {
    first_name: validatedData.first_name,
    surname: validatedData.surname,
    email: validatedData.email,
    mobile_phone: validatedData.mobile_phone ?? null,
    password: hashedPassword // Esta é a hash que vai entrar na coluna password_hash
  };

  // 4. Grava na BD e recupera o utilizador acabado de criar
  const newUserId = await userRepository.createUser(newUserRows);
  const createdUserRows = await userRepository.findUserById(newUserId);
  const user = createdUserRows[0];

  // 5. Gera automaticamente o Token JWT (assim o utilizador faz login imediato ao registar-se)
  const token = generateToken(user.id);

  // 6. Retorna os dados limpos sem expor a password encriptada
  return {
    token,
    user: {
      id: user.id,
      first_name: user.first_name,
      surname: user.surname,
      email: user.email,
      mobile_phone: user.mobile_phone
    }
  };
}

/*
Quando o utilizador fizer um pedido para POST /api/auth/login:

1. O Middleware validateBody intercepta e garante que o JSON tem estrutura de texto válida.

2. O Controller login apanha o email e password do req.body e chama este serviço.

3.Este Service faz os testes de segurança pesados (bcrypt.compare) e cria o token.

4. O Controller recebe o resultado e envia a resposta limpa em JSON de volta para o ecrã do utilizador.
*/