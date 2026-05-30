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

import * as flightRepository from '../repository/flightRepository.js';
import * as tripRepository from '../repository/tripRepository.js';
import { NotFoundError, ValidationError } from '../utils/appErrors.js';

// Transforma o snake_case da BD para camelCase consistente no Frontend
function normalizeFlight(row) {
  return {
    id: row.id,
    tripId: row.trip_id,
    flightNumber: row.flight_number,
    airline: row.airline,
    departureAirport: row.departure_airport,
    arrivalAirport: row.arrival_airport,
    departureDatetime: row.departure_datetime,
    arrivalDatetime: row.arrival_datetime,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// LISTA TODOS OS VOOS
export async function listFlights() {
  const flights = await flightRepository.listFlights();
  return flights.map(normalizeFlight);
}

// CRIA UM NOVO VOO
export async function createFlight(validatedFlight) {
  // Valida se a viagem (tripId) realmente existe no sistema antes de criar o voo
  const tripExists = await tripRepository.findTripById(validatedFlight.tripId);
  if (!tripExists) {
    throw new NotFoundError('The associated trip was not found.');
  }

  const flightId = await flightRepository.createFlight(validatedFlight);
  const flight = await flightRepository.findFlightById(flightId);

  return normalizeFlight(flight);
}

// ATUALIZA UM VOO EXISTENTE
export async function updateFlight(id, validatedFlight) {
  // Se o utilizador estiver a tentar alterar o tripId, validamos se o novo ID existe
  if (validatedFlight.tripId) {
    const tripExists = await tripRepository.findTripById(validatedFlight.tripId);
    if (!tripExists) {
      throw new NotFoundError('The new associated trip was not found.');
    }
  }
  // Se o utilizador tentar alterar pelo menos uma das datas, validamos contra o estado atual da BD
  if (validatedFlight.departureDatetime || validatedFlight.arrivalDatetime) {
    const existingFlight = await flightRepository.findFlightById(id);
  
    if (!existingFlight) {
        throw new NotFoundError('Flight not found.');
    }

    // Garantimos que criamos instâncias estáveis de Date independentemente da origem do dado
    const departureDate = validatedFlight.departureDatetime 
        ? new Date(validatedFlight.departureDatetime) 
        : new Date(existingFlight.departure_datetime);

    const arrivalDate = validatedFlight.arrivalDatetime 
        ? new Date(validatedFlight.arrivalDatetime) 
        : new Date(existingFlight.arrival_datetime);

    // Comparação limpa através dos timestamps primitivos do motor V8 (.getTime())
    if (arrivalDate.getTime() < departureDate.getTime()) {
        throw new ValidationError('Arrival datetime cannot be earlier than departure datetime.');
    }
  }

  // Executa o update otimizado diretamente
  const isUpdated = await flightRepository.updateFlight(id, validatedFlight);

  if (!isUpdated) {
    throw new NotFoundError('Flight not found.');
  }

  const updatedFlight = await flightRepository.findFlightById(id);
  return normalizeFlight(updatedFlight);
}

// APAGA UM VOO EXISTENTE
export async function deleteFlight(id) {
  const flight = await flightRepository.findFlightById(id);

  if (!flight) {
    throw new NotFoundError('Flight not found.');
  }

  await flightRepository.deleteFlight(id);
  return normalizeFlight(flight);
}

// LISTA OS VOOS ASSOCIADOS A UMA VIAGEM
export async function getFlightsByTripId(tripId) {
  const flights = await flightRepository.getFlightsByTripId(tripId);
  return flights.map(normalizeFlight);
}
