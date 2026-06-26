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

  // Passa o id do utilizador para listar apenas os voos das suas viagens
  const currentUserId = req.user.id;
  const flights = await listFlights(currentUserId);

  res.json({ success: true, data: flights });
});

export const postFlight = asyncHandler(async (req, res) => {
  // Passa o id do utilizador para validar se a viagem (trip_id) do body lhe pertence
  const currentUserId = req.user.id;
  const flight = await createFlight(req.body || {}, currentUserId);

  res.status(201).json({ success: true, data: flight });
});

export const patchFlight = asyncHandler(async (req, res) => {
  const flightId = req.params.flightId; 

   // Passa o id do utilizador para validar o dono do voo atual e da nova viagem
  const currentUserId = req.user.id;
  const flight = await updateFlight(flightId, currentUserId, req.body || {});

  res.json({ success: true, data: flight });
});

export const deleteFlightById = asyncHandler(async (req, res) => {
  const flightId = req.params.flightId;

   // Passa o id do utilizador para garantir que só apaga voos das suas viagens
  const currentUserId = req.user.id;
  const flight = await deleteFlight(flightId, currentUserId);

  res.json({ success: true, data: flight });
});
