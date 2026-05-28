/* Rotas REST para gerir accomodations no backend principal.

Este ficheiro expõe apenas o CRUD determinístico da entidade accomodation.
O fluxo conversacional de AI será tratado numa camada própria.
*/

import express from 'express';
import { getAccomodations} from '../controllers/accommodationController.js';

const router = express.Router();

// Rota para obter a lista de Accomodations
router.get('/', getAccomodations);


export default router;