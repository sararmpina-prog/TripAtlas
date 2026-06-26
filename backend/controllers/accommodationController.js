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
// Ajustado com o nome para 'accommodation' com dois 'm' 
import { listAccommodations, deleteAccommodation, createAccommodation, updateAccommodation } from '../services/accommodationService.js';
export const getAccommodations = asyncHandler(async (req, res) => {
    const accommodations = await listAccommodations();

    res.json({
        success: true,
        data: accommodations
    });
});



export const deleteAccommodationById = asyncHandler(async (req, res) => {
    // SUGESTÃO: Alterado de req.params.id para req.params.accommodationId para bater certo com a rota
    const accommodation = await deleteAccommodation(req.params.accommodationId);

    res.json({
        success: true,
        data: accommodation,
    });
});



export const postAccommodation = asyncHandler(async (req, res) => {
    console.log("body is controller estaadia", req.body)
    const accommodation = await createAccommodation(req.body || {});

    res.status(201).json({
        success: true,
        data: accommodation,
    });
});


export const patchAccommodation = asyncHandler(async (req, res) => {
    // SUGESTÃO: Alterado de req.params.id para req.params.accommodationId para bater certo com a rota
    console.log("Controller patch estadia id", req.params.accommodationId);
    const accommodation = await updateAccommodation(req.params.accommodationId, req.body || {});

    res.json({
        success: true,
        data: accommodation,
    });
});