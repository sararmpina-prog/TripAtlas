/* Rotas REST para gerir accomodations no backend principal.

Este ficheiro expõe apenas o CRUD determinístico da entidade accomodation.
O fluxo conversacional de AI será tratado numa camada própria.
*/

import express from 'express';
import { getAccommodations, deleteAccommodationById} from '../controllers/accommodationController.js';
import { validateIdParam } from '../middlewares/validateIdParams.js';

const router = express.Router();

// Rota para obter a lista de Accomodations
router.get('/', getAccommodations);


// Rota para eliminar uma estadia de forma determinística pelo id
router.delete('/:id', validateIdParam('id'),deleteAccommodationById);


export default router;