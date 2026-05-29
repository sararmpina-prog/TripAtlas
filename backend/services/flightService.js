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
  // Valida os dados de entrada com o Zod
  const validatedFlight = validateUpdateFlight(flightData || {});

  // Executa o update. O repository retorna true se encontrou, ou false se não existe
  const isUpdated = await flightRepository.updateFlight(id, validatedFlight);

  if (!isUpdated) {
    throw new NotFoundError('Flight not found.');
  }

  // Procura o voo atualizado para retornar ao cliente
  const updatedFlight = await flightRepository.findFlightById(id);

  return normalizeFlight(updatedFlight);
}

// APAGA UM VOO EXISTENTE
export async function deleteFlight(id) {
  // Procura o voo antes de o apagar para podermos devolver os dados ao cliente
  const flight = await flightRepository.findFlightById(id);

  if (!flight) {
    throw new NotFoundError('Flight not found.');
  }

  // Apaga o voo diretamente da base de dados
  await flightRepository.deleteFlight(id);

  return normalizeFlight(flight);
}

// LISTA OS VOOS ASSOCIADOS A UMA VIAGEM
export async function getFlightsByTripId(tripId) {
  const flights =
    await flightRepository.getFlightsByTripId(tripId);

  return flights.map(normalizeFlight);
}