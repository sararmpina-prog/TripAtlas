/* Rotas REST para gerir accomodations no backend principal.

Este ficheiro expõe apenas o CRUD determinístico da entidade accomodation.
O fluxo conversacional de AI será tratado numa camada própria.
*/

import express from 'express';
import { getAccommodations, deleteAccommodationById, postAccommodation, patchAccommodation} from '../controllers/accommodationController.js';
import { validateIdParam } from '../middlewares/validateIdParams.js';
import {updateAccommodationSchema, createAccommodationSchema} from '../validators/accommodationValidator.js'
import {validateBody} from '../middlewares/validationMiddleware.js'

const router = express.Router();

// Rota para obter a lista de Accomodations
router.get('/', getAccommodations);


// Rota para eliminar uma estadia de forma determinística pelo id
router.delete('/:accommodationId', validateIdParam('accommodationId'),deleteAccommodationById);


// O middleware valida e limpa os dados ANTES de o controller ser executado
router.post('/', validateBody(createAccommodationSchema), postAccommodation);


// Rota para atualizar uma estadia
router.patch('/:accommodationId', validateIdParam('accommodationId'), validateBody(updateAccommodationSchema), patchAccommodation);

export default router;