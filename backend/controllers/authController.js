/* O controller recebe pedidos HTTP, extrai os dados necessários da request, chama os services apropriados e devolve respostas JSON padronizadas. */

import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as authService from '../services/authService.js';

// AUTENTICAÇÃO DE UTILIZADOR
export const login = asyncHandler(async (req, res) => {
  const { email, password_hash } = req.body;
  console.log("email", email)
  console.log("password_hash", password_hash)
  // console.log("controller", req.body)

  // O service trata do SQL, bcrypt e geração do Token JWT
  const authData = await authService.authenticateUser(email, password_hash);

  // Devolve a resposta em JSON limpo
  res.json({
    success: true,
    data: authData // Contém o token e dados básicos do user
  });
});


// REGISTO DE NOVO UTILIZADOR
export const register = asyncHandler(async (req, res) => {
  console.log("controller", req.body)
  // O req.body já vem limpo e em snake_case por causa do createUserSchema do Zod
  const authData = await authService.registerUser(req.body || {});

  // Resposta estruturada idêntica ao Login
  res.status(201).json({
    success: true,
    data: authData
  });
});
