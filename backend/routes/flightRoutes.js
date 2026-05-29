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

const router = express.Router();

router.get('/', getFlights);

router.post('/', postFlight);

router.patch('/:id', patchFlight);

router.delete('/:id', deleteFlightById);

export default router;