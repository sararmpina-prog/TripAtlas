/* O controller recebe pedidos HTTP, extrai os dados necessários da request, chama os services apropriados e devolve respostas JSON padronizadas.

O controller ** NÃO ** deve:
- conter lógica de negócio,
- conhecer SQL
- falar diretamente com a BD
- falar diretamente com Gemini ou outra API externa
(tudo isso é com os services)

O controller é também responsável por lidar com erros de forma consistente, usando o middleware de tratamento de erros para garantir que as respostas de erro sejam padronizadas e informativas.
*/

import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  listAccommodationsReserves,
  deleteAccommodationReserve,
  createReserve, //  -> Adicionada a importação em falta
} from '../services/accommodationReserveService.js';

export const getAccommodationsReserves = asyncHandler(async (req, res) => {
  const accommodationsReserves = await listAccommodationsReserves();

  res.json({
    success: true,
    data: accommodationsReserves,
  });
});

export const deleteAccommodationReserveById = asyncHandler(async (req, res) => {
  // -> Converte o ID para Número logo na entrada para manter o padrão profissional
  const reserveId = Number(req.params.id);

  // -> Passa o ID já convertido para o Service
  const reserve = await deleteAccommodationReserve(reserveId);

  res.json({
    success: true,
    data: reserve,
  });
});

export const postReserve = asyncHandler(async (req, res) => {
  const reserve = await createReserve(req.body || {});

  res.status(201).json({
    success: true,
    data: reserve,
  });
});
