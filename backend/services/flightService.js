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

import * as flightRepository from '../repository/flightRepository.js';
import * as tripRepository from '../repository/tripRepository.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/appErrors.js';

// LISTA TODOS OS VOOS
export async function listFlights(currentUserId) {
  return await flightRepository.listFlightsByUserId(currentUserId);
}

// CRIA UM NOVO VOO
export async function createFlight(validatedFlight, currentUserId) {
  const trip = await tripRepository.findTripById(validatedFlight.trip_id);
  if (!trip) {
    throw new NotFoundError('The associated trip was not found.');
  }

  if (Number(trip.user_id) !== Number(currentUserId)) {
    throw new ForbiddenError('You can only manage flights from your own trips.');
  }

  const flightId = await flightRepository.createFlight(validatedFlight);
  const flight = await flightRepository.findFlightById(flightId);

  return flight;
}

// ATUALIZA UM VOO EXISTENTE
export async function updateFlight(id, currentUserId, validatedFlight) {
  const existingFlight = await flightRepository.findFlightById(id);

  if (!existingFlight) {
    throw new NotFoundError('Flight not found.');
  }

  const currentTrip = await tripRepository.findTripById(existingFlight.trip_id);

  if (!currentTrip) {
    throw new NotFoundError('The associated trip was not found.');
  }

  if (Number(currentTrip.user_id) !== Number(currentUserId)) {
    throw new ForbiddenError('You can only manage flights from your own trips.');
  }

  if (validatedFlight.trip_id) {
    const trip = await tripRepository.findTripById(validatedFlight.trip_id);
    if (!trip) {
      throw new NotFoundError('The new associated trip was not found.');
    }

    if (Number(trip.user_id) !== Number(currentUserId)) {
      throw new ForbiddenError('You can only move flights to your own trips.');
    }
  }

  // Se o utilizador tentar alterar pelo menos uma das datas, validamos contra o estado atual da BD
  if (validatedFlight.departure_datetime || validatedFlight.arrival_datetime) {
    // Isolamos os objetos Date apenas para a validação numérica milimétrica
    const departureDateObject = validatedFlight.departure_datetime 
        ? new Date(validatedFlight.departure_datetime) // new Date() para garantir que temos um objeto Date estável, independentemente de fusos horários e que as datas existem no calendário (não ter datas inválidas como 2024-02-30)
        : new Date(existingFlight.departure_datetime);

    const arrivalDateObject = validatedFlight.arrival_datetime 
        ? new Date(validatedFlight.arrival_datetime) 
        : new Date(existingFlight.arrival_datetime);

    if (arrivalDateObject.getTime() < departureDateObject.getTime()) { // getTime() para comparar os timestamps numéricos, evitando problemas de fuso horário ou formatos de data
        throw new ValidationError('Arrival datetime cannot be earlier than departure datetime.');
    }
  }
    /* se tentarmos comparar dois objetos de data diretamente usando operadores como < ou >, podemos obter comportamentos inconsistentes ou falhas silenciosas, porque estão a ser comparados dois objetos na memória e não os valores cronológicos em si;
    getTime() converte a data para o número de milissegundos desde 1 de Janeiro de 1970, permitindo uma comparação direta e evitando problemas de fuso horário ou formatação */


  // Executa o update otimizado diretamente
  const isUpdated = await flightRepository.updateFlight(id, validatedFlight);

  if (!isUpdated) {
    throw new NotFoundError('Flight not found.');
  }

  const updatedFlight = await flightRepository.findFlightById(id);
  return updatedFlight;
}

// APAGA UM VOO EXISTENTE
export async function deleteFlight(id, currentUserId) {
  const flight = await flightRepository.findFlightById(id);

  if (!flight) {
    throw new NotFoundError('Flight not found.');
  }

  const trip = await tripRepository.findTripById(flight.trip_id);

  if (!trip) {
    throw new NotFoundError('The associated trip was not found.');
  }

  if (Number(trip.user_id) !== Number(currentUserId)) {
    throw new ForbiddenError('You can only manage flights from your own trips.');
  }

  await flightRepository.deleteFlight(id);
  return flight;
}

// LISTA OS VOOS ASSOCIADOS A UMA VIAGEM
export async function getFlightsByTripId(tripId) {
  return await flightRepository.getFlightsByTripId(tripId);
}