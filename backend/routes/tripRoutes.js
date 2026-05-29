/* Rotas REST para gerir trips no backend principal.

Este ficheiro expõe apenas o CRUD determinístico da entidade trip.
O fluxo conversacional de AI será tratado numa camada própria.
*/

import express from 'express';
import { deleteTripById, getTrips, patchTrip, postTrip } from '../controllers/tripController.js';

const router = express.Router();

// Rota para obter a lista de Trips
router.get('/', getTrips);

// Rota para criar uma Trip
router.post('/', postTrip);

// Rota para atualizar / patch uma Trip
router.patch('/:id', patchTrip);

// Rota para eliminar uma Trip de forma determinística pelo id
router.delete('/:id', deleteTripById);

export default router;