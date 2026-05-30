/* Service de tarefas:

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
// Os dados chegam aqui 100% validados pelo middleware do Zod
export async function createFlight(validatedFlight) {
  const flightId = await flightRepository.createFlight(validatedFlight);
  const flight = await flightRepository.findFlightById(flightId);

  return normalizeFlight(flight);
}

// ATUALIZA UM VOO EXISTENTE
// Os dados de formato chegam validados, mas tratamos a regra cronológica de negócio aqui
export async function updateFlight(id, validatedFlight) {
  // Se o utilizador tentar alterar pelo menos uma das datas, validamos contra o estado atual da BD
  if (validatedFlight.departureDatetime || validatedFlight.arrivalDatetime) {
    const existingFlight = await flightRepository.findFlightById(id);
    
    if (!existingFlight) {
      throw new NotFoundError('Flight not found.');
    }

    // Fusão inteligente: Usa a nova data enviada ou mantém a que já estava gravada
    const departure = validatedFlight.departureDatetime || existingFlight.departure_datetime;
    const arrival = validatedFlight.arrivalDatetime || existingFlight.arrival_datetime;

    if (new Date(arrival) < new Date(departure)) {
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
