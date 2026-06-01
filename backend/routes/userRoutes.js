/* Rotas REST para gerir users no backend principal.

Este ficheiro expõe apenas o CRUD determinístico da entidade users.
*/

import express from 'express';

import {
  getUsers,
  postUser,
  patchUser,
  deleteUserById,
} from '../controllers/userController.js';

// Middlewares
import { validateIdParam } from '../middlewares/validateIdParams.js';
import { validateBody } from '../middlewares/validationMiddleware.js';
import { createUserSchema, updateUserSchema } from '../validators/userValidator.js';

const router = express.Router();

router.get('/', getUsers);

// O middleware valida e limpa os dados ANTES de o controller ser executado
router.post('/', validateBody(createUserSchema), postUser);

router.patch('/:userId', validateIdParam('userId'), validateBody(updateUserSchema), patchUser);

router.delete('/:userId', validateIdParam('userId'), deleteUserById);

export default router;