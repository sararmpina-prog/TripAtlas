/* Service:
Faz a ponte entre controllers / tool calls e a persistência, mantendo aqui:
- resolução de targets
- validação de regras de negócio
- normalização de input/output

Fluxo arquitetural:
Controller (recebe request/resposta HTTP)
   ↓
Service (decide regras de negócio)
   ↓
Database (armazenamento persistente)

Nota importante:
  A AI nunca acede diretamente à base de dados.
  Apenas chama funções expostas por este service.
*/

import * as suggestionRepository from '../repository/suggestionRepository.js';
import { NotFoundError, ForbiddenError } from '../utils/appErrors.js';


// LISTA TODOS AS SUGESTÕES
export async function listSuggestions(tripId, tripReference, userId) {
  return await suggestionRepository.listSuggestionsByTripId(tripId, tripReference, userId);
}


// APAGA UMA SUGESTÃO EXISTENTE
export async function deleteSuggestion(id, currentUserId) {
  const suggestion = await suggestionRepository.findSuggestionById(id);

  if (!suggestion) {
    throw new NotFoundError('Suggestion not found.');
  }

  if (Number(suggestion.user_id) !== Number(currentUserId)) {
    throw new ForbiddenError('You can only manage suggestions from your own journal.');
  }

  await suggestionRepository.deleteSuggestion(id);

  return suggestion;
}

