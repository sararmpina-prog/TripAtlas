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

// LISTA TODOS AS SUGESTÕES
export async function listSuggestions(tripId, tripName, userId) {
  return await suggestionRepository.listSuggestionsByTripId(tripId, tripName, userId);
}