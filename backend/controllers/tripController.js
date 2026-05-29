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
import { createTrip, deleteTrip, listTrips, updateTrip } from '../services/tripService.js';

export const getTrips = asyncHandler(async (req, res) => {
	const trips = await listTrips();

	res.json({
		success: true,
		data: trips,
	});
});

export const postTrip = asyncHandler(async (req, res) => {
	const trip = await createTrip(req.body || {});

	res.status(201).json({
		success: true,
		data: trip,
	});
});

export const patchTrip = asyncHandler(async (req, res) => {
	const trip = await updateTrip(req.params.id, req.body || {});

	res.json({
		success: true,
		data: trip,
	});
});

export const deleteTripById = asyncHandler(async (req, res) => {
	const trip = await deleteTrip(req.params.id);

	res.json({
		success: true,
		data: trip,
	});
});

