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
import {listAccomodations, deleteAccommodation, createAccommodation, updateAccommodation} from '../services/accomodationService.js'

export const getAccommodations = asyncHandler(async (req, res) => {
    const accommodations = await listAccomodations();

    res.json({
        success: true,
        data: accommodations
    });
});



export const deleteAccommodationById = asyncHandler(async (req, res) => {
    const accommodation = await deleteAccommodation(req.params.id);

    res.json({
        success: true,
        data: accommodation,
    });
});



export const postTrip = asyncHandler(async (req, res) => {
    console.log("body is controller estaadia", req.body)
    const accommodation = await createAccommodation(req.body || {});

    res.status(201).json({
        success: true,
        data: accommodation,
    });
});


export const patchAccommodation = asyncHandler(async (req, res) => {
    console.log("Controller patch estadia id", req.params.id)
    const accommodation = await updateAccommodation(req.params.id, req.body || {});

    res.json({
        success: true,
        data: accommodation,
    });
});