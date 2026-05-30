/* O controller recebe pedidos HTTP, extrai os dados necessários da request, chama os services apropriados e devolve respostas JSON padronizadas.

O controller ** NÂO ** deve:
- conter lógica de negócio,
- conhecer SQL
- falar diretamente com a BD
- falar directamente com Gemini ou outra API externa
(tudo isso é com os services)

O controller é também responsável por lidar com erros de forma consistente, usando o middleware de tratamento de erros para garantir que as respostas de erro sejam padronizadas e informativas.
*/

import { asyncHandler } from '../middlewares/asyncHandler.js';

import {
  createFlight,
  deleteFlight,
  listFlights,
  updateFlight,
} from '../services/flightService.js';

export const getFlights = asyncHandler(async (req, res) => {
  const flights = await listFlights();

  res.json({
    success: true,
    data: flights,
  });
});

export const postFlight = asyncHandler(async (req, res) => {
  const flight = await createFlight(req.body || {});

  res.status(201).json({
    success: true,
    data: flight,
  });
});

export const patchFlight = asyncHandler(async (req, res) => {
  const flight = await updateFlight(
    req.params.id,
    req.body || {}
  );

  res.json({
    success: true,
    data: flight,
  });
});

export const deleteFlightById = asyncHandler(async (req, res) => {
  const flight = await deleteFlight(req.params.id);

  res.json({
    success: true,
    data: flight,
  });
});
