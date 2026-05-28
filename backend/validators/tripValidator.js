import { createValidationError } from '../utils/validationHelpers.js';

const validTripStatuses = ['PLANNING', 'COMPLETED'];

function requireText(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createValidationError(`O campo ${fieldName} é obrigatório.`);
  }

  return value.trim();
}

function normalizeOptionalText(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw createValidationError(`O campo ${fieldName} deve ser texto.`);
  }

  return value.trim() || null;
}

function normalizeIsoDate(value, fieldName) {
  const normalizedValue = requireText(value, fieldName);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    throw createValidationError(`O campo ${fieldName} deve usar o formato YYYY-MM-DD.`);
  }

  return normalizedValue;
}

function normalizeUserId(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (!/^\d+$/.test(String(value))) {
    throw createValidationError('O campo userId deve ser um id numérico válido.');
  }

  return Number(value);
}

function buildValidatedTrip(payload = {}, { requireAtLeastOneField = false } = {}) {
  const trip = {};

  if (payload.title !== undefined || !requireAtLeastOneField) {
    trip.title = payload.title === undefined ? null : requireText(payload.title, 'title');
  }

  if (payload.description !== undefined || !requireAtLeastOneField) {
    trip.description = normalizeOptionalText(payload.description, 'description');
  }

  if (payload.destination !== undefined || !requireAtLeastOneField) {
    trip.destination = requireText(payload.destination, 'destination');
  }

  if (payload.startDate !== undefined || !requireAtLeastOneField) {
    trip.startDate = normalizeIsoDate(payload.startDate, 'startDate');
  }

  if (payload.endDate !== undefined || !requireAtLeastOneField) {
    trip.endDate = normalizeIsoDate(payload.endDate, 'endDate');
  }

  if (payload.userId !== undefined || !requireAtLeastOneField) {
    trip.userId = normalizeUserId(payload.userId);
  }

  if (trip.startDate && trip.endDate && trip.endDate < trip.startDate) {
    throw createValidationError('A data de fim não pode ser anterior à data de início.');
  }

  if (requireAtLeastOneField && Object.keys(trip).length === 0) {
    throw createValidationError('Indica pelo menos um campo para atualizar.');
  }

  return trip;
}

export function validateCreateTrip(payload = {}) {
  return buildValidatedTrip(payload);
}

export function validateUpdateTrip(payload = {}) {
  return buildValidatedTrip(payload, { requireAtLeastOneField: true });
}

export function validateTripId(value) {
  if (!/^\d+$/.test(String(value))) {
    throw createValidationError('É necessário indicar um id válido para a trip.');
  }

  return Number(value);
}
