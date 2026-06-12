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
import {listAccommodationsReservesByUser, deleteAccommodationReserve, createReserve, updateReserve} from '../services/reserveService.js'



export const getAccommodationsReserves = asyncHandler(async (req, res) => {

    // Recolhe o ID injetado pelo auth middleware no app.js
    const currentUserId = req.user.id; 

    // Passa o ID para o service filtrar a query do cenário A
    const accommodationsReserves = await listAccommodationsReservesByUser(currentUserId);

    res.json({
        success: true,
        data: accommodationsReserves
    });
});


export const deleteAccommodationReserveById = asyncHandler(async (req, res) => {
    // Alterado de req.params.id para req.params.reserveId para bater certo com a rota
    const reserve = await deleteAccommodationReserve(req.params.reserveId);
    res.json({ success: true, data: reserve });
});

export const postReserve = asyncHandler(async (req, res) => {
    console.log("body is", req.body)

    // Passa o ID para verificar se a viagem associada é deste utilizador
    const reserve = await createReserve(req.body || {}, currentUserId);
    res.status(201).json({
        success: true,
        data: reserve,
    });
});

export const patchReserve = asyncHandler(async (req, res) => {
    console.log("Controller patch reserva id", req.params)
    
    const reserve = await updateReserve(req.params.reserveId, currentUserId, req.body || {});

    res.json({
        success: true,
        data: reserve,
    });
});
