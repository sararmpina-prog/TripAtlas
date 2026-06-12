/* Rotas REST para gerir trips no backend principal.

Este ficheiro expõe apenas o CRUD determinístico da entidade trip.
*/

import express from 'express';

import {
  getTrips,
  postTrip,
  patchTrip,
  deleteTripById,
} from '../controllers/tripController.js';

// Middlewares
import { validateIdParam } from '../middlewares/validateIdParams.js';
import { validateBody } from '../middlewares/validationMiddleware.js';
import { createTripSchema, updateTripSchema } from '../validators/tripValidator.js';

const router = express.Router();

router.get('/', getTrips);

// O middleware valida e limpa os dados ANTES de o controller ser executado
router.post('/', validateBody(createTripSchema), postTrip);

router.patch('/:tripId', validateIdParam('tripId'), validateBody(updateTripSchema), patchTrip);

router.delete('/:tripId', validateIdParam('tripId'), deleteTripById);

export default router;
