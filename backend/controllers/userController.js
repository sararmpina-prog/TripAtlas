/* O controller recebe pedidos HTTP, extrai os dados necessários da request, chama os services apropriados e devolve respostas JSON padronizadas.

O controller ** NÃO ** deve:
- conter lógica de negócio,
- conhecer SQL
- falar diretamente com a BD
- falar diretamente com Gemini ou outra API externa
(tudo isso é com os services)

O controller é também responsável por lidar com erros de forma consistente, usando o middleware de tratamento de erros para garantir que as respostas de erro sejam padronizadas e informativas.
*/

import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as userService from '../services/userService.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(); 
  res.json({ success: true, data: users });
});

export const postUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body || {});
  res.status(201).json({ success: true, data: user });
});

export const patchUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId; 

  const user = await userService.updateUser(userId, req.body || {});
  res.json({ success: true, data: user });
});

export const deleteUserById = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const user = await userService.deleteUser(userId);
  res.json({ success: true, data: user });
});
