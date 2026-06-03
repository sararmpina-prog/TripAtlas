/* Rotas REST para gerir flights no backend principal.

Este ficheiro expõe apenas o CRUD determinístico da entidade flights.
*/

import express from 'express';

import {
  getFlights,
  postFlight,
  patchFlight,
  deleteFlightById,
} from '../controllers/flightController.js';

// Middlewares
import { validateIdParam } from '../middlewares/validateIdParams.js';
import { validateBody } from '../middlewares/validationMiddleware.js';
import { createFlightSchema, updateFlightSchema } from '../validators/flightValidator.js';

const router = express.Router();

router.get('/', getFlights);

// O middleware valida e limpa os dados ANTES de o controller ser executado
router.post('/', validateBody(createFlightSchema), postFlight);

router.patch('/:flightId', validateIdParam('flightId'), validateBody(updateFlightSchema), patchFlight);

router.delete('/:flightId', validateIdParam('flightId'), deleteFlightById);

export default router;