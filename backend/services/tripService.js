/* Service:
Faz a ponte entre controllers / tool calls e a persistência, mantendo aqui:
- resolução de targets
- validação de regras de negócio
- normalização de input/output

Fluxo arquitetural:
Controller (recebe request/resposta HTTP)
   ↓
Task Service (decide regras de negócio)
   ↓
Database (armazenamento persistente)

Nota importante:
  A AI nunca acede diretamente à base de dados.
  Apenas chama funções expostas por este service.
*/

import * as tripRepository from '../repository/tripRepository.js';
import * as userRepository from '../repository/userRepository.js'; // 1. Importação adicionada para validar utilizadores
import { NotFoundError, ValidationError } from '../utils/appErrors.js';

// Transforma o snake_case da BD para camelCase consistente no Frontend
function normalizeTrip(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// LISTA TODAS AS VIAGENS
export async function listTrips() {
  const trips = await tripRepository.listTrips();
  return trips.map(normalizeTrip);
}

// CRIA UMA NOVA VIAGEM
// Os dados de formato chegam validados, mas validamos as chaves relacionais aqui
export async function createTrip(validatedTrip) {
  // Valida se o utilizador associado realmente existe na BD antes de criar a viagem
  const userExists = await userRepository.findUserById(validatedTrip.userId);
  if (!userExists) {
    throw new NotFoundError('The associated user was not found.');
  }

  const tripId = await tripRepository.createTrip(validatedTrip);
  const trip = await tripRepository.findTripById(tripId);

  return normalizeTrip(trip);
}

// ATUALIZA UMA VIAGEM EXISTENTE
// Os dados de formato chegam validados, mas tratamos a regra cronológica e relacional de negócio aqui
export async function updateTrip(id, validatedTrip) {
  // Se tentar alterar o userId, valida contra a tabela de utilizadores (userRepository)
  if (validatedTrip.userId) {
    const userExists = await userRepository.findUserById(validatedTrip.userId);
    if (!userExists) {
      throw new NotFoundError('The new associated user was not found.');
    }
  }

  // Se tentar alterar pelo menos uma das datas, validamos contra o estado atual da BD
  if (validatedTrip.startDate || validatedTrip.endDate) {
    const existingTrip = await tripRepository.findTripById(id);
  
    if (!existingTrip) {
      throw new NotFoundError('Trip not found.');
    }

    // Garantimos que criamos instâncias estáveis de Date independentemente da origem do dado
    const startDate = validatedTrip.startDate 
      ? new Date(validatedTrip.startDate) 
      : new Date(existingTrip.start_date);

    const endDate = validatedTrip.endDate 
      ? new Date(validatedTrip.endDate) 
      : new Date(existingTrip.end_date);

    // Comparação limpa através dos timestamps primitivos:
    if (endDate.getTime() < startDate.getTime()) {
      throw new ValidationError('The end date cannot be earlier than the start date.');
    }
  }
    /* se tentarmos comparar dois objetos de data diretamente usando operadores como < ou >, podemos obter comportamentos inconsistentes ou falhas silenciosas, porque estão a ser comparados dois objetos na memória e não os valores cronológicos em si;
    getTime() converte a data para o número de milissegundos desde 1 de Janeiro de 1970, permitindo uma comparação direta e evitando problemas de fuso horário ou formatação */

  // Executa o update otimizado diretamente
  const isUpdated = await tripRepository.updateTrip(id, validatedTrip);

  if (!isUpdated) {
    throw new NotFoundError('Trip not found.');
  }

  const updatedTrip = await tripRepository.findTripById(id);
  return normalizeTrip(updatedTrip);
}

// APAGA UMA VIAGEM EXISTENTE
export async function deleteTrip(id) {
  const trip = await tripRepository.findTripById(id);

  if (!trip) {
    throw new NotFoundError('Trip not found.');
  }

  await tripRepository.deleteTrip(id);
  return normalizeTrip(trip);
}

/* Caminho dos erros no service:

- Service lança erros específicos (NotFoundError, ValidationError);
- asyncHandler no controller apanha esses erros (.catch(next)) e passa-os para a frente;
- appErrors define a identidade do erro (statusCode, message);
- errorHandler recebe o erro, lê as marcas de identidade que o appErrors definiu e responde ao utilizador com um formato JSON consistente e o código HTTP correto.
*/
