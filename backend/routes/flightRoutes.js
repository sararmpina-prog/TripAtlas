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
import { validateBody } from '../middlewares/validationMiddleware.js';
import { createFlightSchema, updateFlightSchema } from '../validators/flightValidator.js';

const router = express.Router();

router.get('/', getFlights);

// O middleware valida e limpa os dados ANTES de o controller ser executado
router.post('/', validateBody(createFlightSchema), postFlight);

router.patch('/:id', validateBody(updateFlightSchema), patchFlight);

router.delete('/:id', deleteFlightById);

export default router;