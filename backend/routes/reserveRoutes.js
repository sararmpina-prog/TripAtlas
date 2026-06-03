/* Rotas REST para gerir reserves no backend principal.

Este ficheiro expõe apenas o CRUD determinístico da entidade reserve.
O fluxo conversacional de AI será tratado numa camada própria.
*/

import express from 'express';
import { getAccommodationsReserves, deleteAccommodationReserveById, postReserve, patchReserve} from '../controllers/reserveController.js';
import {updateReserveSchema, createReserveSchema} from '../validators/reserveValidator.js'
import {validateBody} from '../middlewares/validationMiddleware.js'
import {validateIdParam} from '../middlewares/validateIdParams.js'

const router = express.Router();

// Rota para obter a lista de reservas dos hoteis
router.get('/', getAccommodationsReserves);

// Rota para criar uma reserva
router.post('/',  validateBody(createReserveSchema), postReserve);

// Rota para eliminar uma reserva de um hotel de forma determinística pelo id
router.delete('/:reserveId', validateIdParam('reserveId'), deleteAccommodationReserveById);

// Rota para atualizar uma reserva
router.patch('/:reserveId', validateIdParam('reserveId'), validateBody(updateReserveSchema), patchReserve);

export default router;