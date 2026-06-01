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
import {listAccomodations, deleteAccommodation} from '../services/accomodationService.js'

export const getAccommodations = asyncHandler(async (req, res) => {
    const accommodations = await listAccomodations();

    res.json({
        success: true,
        data: accommodations
    });
});



export const deleteAccommodationById = asyncHandler(async (req, res) => {
    const reserve = await deleteAccommodation(req.params.id);

    res.json({
        success: true,
        data: reserve,
    });
});