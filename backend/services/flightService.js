import * as flightRepository from '../repository/flightRepository.js';
import { NotFoundError } from '../utils/appErrors.js';
import {
  validateCreateFlight,
  validateUpdateFlight,
} from '../validators/flightValidator.js';

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

// função auxiliar para garantir que um voo existe antes de fazer update ou delete
async function findFlightOrFail(id) {
  const flight = await flightRepository.findFlightById(id);

  if (!flight) {
    throw new NotFoundError('Flight not found.');
  }

  return flight;
}

// CRIA UM NOVO VOO
export async function createFlight(data) {
  const validatedFlight = validateCreateFlight(data || {});
  const flightId =
    await flightRepository.createFlight(validatedFlight);

  const flight =
    await flightRepository.findFlightById(flightId);

  return normalizeFlight(flight);
}

// ATUALIZA UM VOO EXISTENTE
export async function updateFlight(id, flightData) {
  await findFlightOrFail(id);
  const validatedFlight = validateUpdateFlight(flightData || {});

  await flightRepository.updateFlight(id, validatedFlight);

  const updatedFlight = await findFlightOrFail(id);

  return normalizeFlight(updatedFlight);
}

// APAGA UM VOO EXISTENTE
export async function deleteFlight(id) {
  const existingFlight =
    await findFlightOrFail(id);

  await flightRepository.deleteFlight(id);

  return normalizeFlight(existingFlight);
}

// LISTA OS VOOS ASSOCIADOS A UMA VIAGEM
export async function getFlightsByTripId(tripId) {
  const flights =
    await flightRepository.getFlightsByTripId(tripId);

  return flights.map(normalizeFlight);
}