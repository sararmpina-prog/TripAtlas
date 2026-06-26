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
import {listSuggestions, deleteSuggestion} from '../services/suggestionsService.js'
import * as tripRepository from '../repository/tripRepository.js';


export const getSuggestions = asyncHandler(async (req, res) => {


  const { trip_name } = req.query;


  console.log("trip_name é", trip_name)
  console.log("req.query é", req.query)

  const trip = await tripRepository.getTripByName(trip_name);

  if (!trip) {
    return res.status(404).json({ success: false, message: 'Trip não encontrada' });
  }
  
  console.log("trip id é", trip.id)
  console.log("user id é", trip.user_id)

  // await suggestionRepository.updateTripIdSuggestions(trip.id)

  const suggestions = await listSuggestions(trip.id, trip.title, trip.user_id);

  res.json({ success: true, data: suggestions });
});


export const deleteSuggestionById = asyncHandler(async (req, res) => {

  console.log('req.params=', req.params);
  const suggestionId = req.params.suggestionId;

   console.log("req.suggestionId", suggestionId)

   // Passa o id do utilizador para garantir que só apaga sugestões do seu journal
  const currentUserId = req.user.id;
  console.log("req.user",req.user.id )

  const suggestion = await deleteSuggestion(suggestionId, currentUserId);

  res.json({ success: true, data: suggestion });
});

