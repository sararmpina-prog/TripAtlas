/* Este ficheiro centraliza validações relacionadas com tarefas antes da persistência na base de dados.

Mesmo usando AI e function calling, o backend continua responsável pela validação final dos dados.
O backend deve garantir que os dados recebidos são válidos e seguros para processar, evitando erros e mantendo a integridade da aplicação.

(é validação determinística depois da interpretação probabilística da AI)

Fluxo con defesa em profundidade:

Frontend Validation
        ↓
Prompt Constraints
        ↓
Function Calling Schema
        ↓
Backend Validation
        ↓
Database
*/

import { createValidationError } from '../validationHelpers.js';

const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function hasText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

export function normalizeTaskTarget(target) {
  if (typeof target !== 'string') {
    return target;
  }

  const trimmedTarget = target.trim();
  const prefixedIdMatch = trimmedTarget.match(/^id\s*(\d+)$/i);
  const hashOnlyIdMatch = trimmedTarget.match(/^#(\d+)$/);
  const titleWithHashIdMatch = trimmedTarget.match(/^.+\s+#(\d+)$/);

  if (prefixedIdMatch) {
    return prefixedIdMatch[1];
  }

  if (hashOnlyIdMatch) {
    return hashOnlyIdMatch[1];
  }

  if (titleWithHashIdMatch) {
    return titleWithHashIdMatch[1];
  }

  return trimmedTarget;
}

function isAcceptedDueDateInput(value) {
  if (!hasText(value)) {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();

  return /^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)
    || normalizedValue === 'ontem'
    || normalizedValue === 'hoje'
    || normalizedValue === 'amanha'
    || normalizedValue === 'amanhã';
}

export function validateTaskPriority(priority) {
  if (priority === undefined || priority === null || priority === '') {
    return;
  }

  if (!validPriorities.includes(priority)) {
    throw createValidationError('Prioridade inválida');
  }
}

export function validateTaskCompleted(completed) {
  if (completed === undefined || completed === null || completed === '') {
    return;
  }

  if (typeof completed !== 'boolean') {
    throw createValidationError('O campo completed deve ser booleano');
  }
}

export function validateTaskDueDateInput(dueDate) {
  if (dueDate === undefined || dueDate === null || dueDate === '') {
    return;
  }

  if (typeof dueDate !== 'string' || !isAcceptedDueDateInput(dueDate)) {
    throw createValidationError('Data inválida. Usa YYYY-MM-DD, ontem, hoje ou amanhã');
  }
}

export function normalizeTaskDueDateInput(dueDate, referenceDate = new Date()) {
  if (dueDate === undefined || dueDate === null || dueDate === '') {
    return null;
  }

  validateTaskDueDateInput(dueDate);

  const normalizedValue = dueDate.trim().toLowerCase();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return normalizedValue;
  }

  if (normalizedValue === 'ontem') {
    const yesterday = new Date(referenceDate);
    yesterday.setDate(referenceDate.getDate() - 1);
    return toIsoDate(yesterday);
  }

  if (normalizedValue === 'hoje') {
    return toIsoDate(referenceDate);
  }

  if (normalizedValue === 'amanha' || normalizedValue === 'amanhã') {
    const tomorrow = new Date(referenceDate);
    tomorrow.setDate(referenceDate.getDate() + 1);
    return toIsoDate(tomorrow);
  }

  throw createValidationError('Data inválida. Usa YYYY-MM-DD, ontem, hoje ou amanhã');
}

export function validateTaskTarget(target) {
  const normalizedTarget = normalizeTaskTarget(target);

  if (!hasText(normalizedTarget) && !/^\d+$/.test(String(normalizedTarget ?? ''))) {
    throw createValidationError('Target é obrigatório');
  }
}

export function validateCreateTask({ task, priority, dueDate }) {
  if (!hasText(task)) {
    throw createValidationError('Título da tarefa é obrigatório');
  }

  validateTaskPriority(priority);
  validateTaskDueDateInput(dueDate);
}

export function validateUpdateTask(data) {
  validateTaskTarget(data.target);
  validateTaskPriority(data.priority);
  validateTaskDueDateInput(data.dueDate);
  validateTaskCompleted(data.completed);
}
