/* Camada centralizada de debug/logging da integração Gemini.
   Evita o flooding do terminal sanitizando payloads complexos da IA. */

import { z } from 'zod';

// Helper do Zod que transforma strings do .env em Booleanos reais (true/false) de forma limpa
const envBoolean = z.string().optional().transform(val => /^(1|true|yes|on)$/i.test(val || ''));

const DEBUG_LOG_ENABLED = envBoolean.parse(process.env.GEMINI_DEBUG_LOGS);
const DEBUG_LOG_JSON = envBoolean.parse(process.env.GEMINI_DEBUG_JSON);

function sanitizeValue(value) {
  if (value == null) return value;

  if (typeof value === 'string') {
    return value.length > 220 ? `${value.slice(0, 220)}...` : value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 10).map(sanitizeValue);
  }
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, currentValue]) => [key, sanitizeValue(currentValue)])
    );
  }
  return value;
}

function formatDebugValue(value, indentLevel = 0) {
  const indent = '  '.repeat(indentLevel);
  const nextIndent = '  '.repeat(indentLevel + 1);

  if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return ['[', ...value.map((entry) => `${nextIndent}- ${formatDebugValue(entry, indentLevel + 1)}`), `${indent}]`].join('\n');
  }

  const entries = Object.entries(value);
  if (entries.length === 0) return '{}';

  return [
    '{',
    ...entries.map(([key, currentValue]) => {
      const formattedValue = formatDebugValue(currentValue, indentLevel + 1);
      const valueLines = formattedValue.split('\n');
      return valueLines.length === 1 ? `${nextIndent}${key}: ${valueLines[0]}` : `${nextIndent}${key}: ${valueLines[0]}\n${valueLines.slice(1).join('\n')}`;
    }),
    `${indent}}`
  ].join('\n');
}

export function isGeminiDebugLoggingEnabled() {
  return DEBUG_LOG_ENABLED;
}

export function logGeminiDebug(scope, event, details = {}) {
  if (!DEBUG_LOG_ENABLED) return;

  const payload = {
    timestamp: new Date().toISOString(),
    scope,
    event,
    ...sanitizeValue(details),
  };

  if (DEBUG_LOG_JSON) {
    console.log('[taskbot-debug]', JSON.stringify(payload));
    return;
  }

  const { timestamp, ...remainingPayload } = payload;
  const formattedDetails = formatDebugValue(remainingPayload, 1).split('\n').map((line) => `  ${line}`).join('\n');
  
  console.log(`\n🤖 [${timestamp}] [${scope} -> ${event}]:\n${formattedDetails}`);
}
