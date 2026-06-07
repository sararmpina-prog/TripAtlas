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

import * as tripRepository from '../repository/tripRepository.js';
import * as userRepository from '../repository/userRepository.js'; // 1. Importação adicionada para validar utilizadores
import { NotFoundError, ValidationError } from '../utils/appErrors.js';

// LISTA TODAS AS VIAGENS
export async function listTrips() {
  return await tripRepository.listTrips(); // Retorna diretamente o array em snake_case da BD
}

// CRIA UMA NOVA VIAGEM
export async function createTrip(validatedTrip) {
  // CORREÇÃO: Alterado de .userId para .user_id
  const user = await userRepository.findUserById(validatedTrip.user_id);
  if (!user) {
    throw new NotFoundError('The associated user was not found.');
  }

  const tripId = await tripRepository.createTrip(validatedTrip);
  const trip = await tripRepository.findTripById(tripId);

  return trip;
}

// ATUALIZA UMA VIAGEM EXISTENTE
export async function updateTrip(id, validatedTrip) {
  if (validatedTrip.user_id) {
    const user = await userRepository.findUserById(validatedTrip.user_id);
    if (!user) {
      throw new NotFoundError('The new associated user was not found.');
    }
  }

  if (validatedTrip.start_date || validatedTrip.end_date) {
    const existingTrip = await tripRepository.findTripById(id);
  
    if (!existingTrip) {
      throw new NotFoundError('Trip not found.');
    }
    
    const startDate = validatedTrip.start_date 
      ? new Date(validatedTrip.start_date) // new Date() para garantir que temos um objeto Date estável, independentemente de fusos horários e que as datas existem no calendário (não ter datas inválidas como 2024-02-30)
      : new Date(existingTrip.start_date);

    const endDate = validatedTrip.end_date 
      ? new Date(validatedTrip.end_date) 
      : new Date(existingTrip.end_date);

    if (endDate.getTime() < startDate.getTime()) { // getTime() para comparar os timestamps numéricos, evitando problemas de fuso horário ou formatos de data
      throw new ValidationError('The end date cannot be earlier than the start date.');
    }
  }

  const isUpdated = await tripRepository.updateTrip(id, validatedTrip);

  if (!isUpdated) {
    throw new NotFoundError('Trip not found.');
  }

  const updatedTrip = await tripRepository.findTripById(id);
  return updatedTrip;
}

// APAGA UMA VIAGEM EXISTENTE
export async function deleteTrip(id) {
  const trip = await tripRepository.findTripById(id);

  if (!trip) {
    throw new NotFoundError('Trip not found.');
  }

  await tripRepository.deleteTrip(id);
  return trip;
}

/* Caminho dos erros no service:

- Service lança erros específicos (NotFoundError, ValidationError);
- asyncHandler no controller apanha esses erros (.catch(next)) e passa-os para a frente;
- appErrors define a identidade do erro (statusCode, message);
- errorHandler recebe o erro, lê as marcas de identidade que o appErrors definiu e responde ao utilizador com um formato JSON consistente e o código HTTP correto.
*/
