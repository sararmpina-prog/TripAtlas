/* Rotas REST para gerir users no backend principal.

Este ficheiro expõe apenas o CRUD determinístico da entidade users.
*/

import express from 'express';

import {
  getUsers,
  postUser,
  patchUser,
  patchUserPassword,
  deleteUserById,
} from '../controllers/userController.js';

// Middlewares
import { validateIdParam } from '../middlewares/validateIdParams.js';
import { validateBody } from '../middlewares/validationMiddleware.js';
import { createUserSchema, updateUserSchema, updatePasswordSchema } from '../validators/userValidator.js';

const router = express.Router();

router.get('/', getUsers);

// O middleware valida e limpa os dados ANTES de o controller ser executado
router.post('/', validateBody(createUserSchema), postUser); // Rota só de admin; os novos users são criados via "register"

router.patch('/:userId/password', validateIdParam('userId'), validateBody(updatePasswordSchema), patchUserPassword); // Rota específica para atualizar password (separada do perfil por questões de segurança)
router.patch('/:userId', validateIdParam('userId'), validateBody(updateUserSchema), patchUser);

router.delete('/:userId', validateIdParam('userId'), deleteUserById);

export default router;