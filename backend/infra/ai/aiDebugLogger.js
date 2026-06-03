/*
Camada centralizada de debug/logging da integração Gemini.

Este ficheiro existe para:
- evitar espalhar console.log pela aplicação
- normalizar logs da AI num único formato
- permitir ativação/desativação via variáveis de ambiente
*/

import { z } from 'zod';
// import fs from 'fs'; // IMPORTAÇÃO: Módulo nativo do Node.js para gerir ficheiros no disco

// Helper do Zod que transforma strings do .env em Booleanos reais (true/false) de forma limpa
const envBoolean = z.string().optional().transform(val => /^(1|true|yes|on)$/i.test(val || ''));

const DEBUG_LOG_ENABLED = envBoolean.parse(process.env.GEMINI_DEBUG_LOGS);
const DEBUG_LOG_JSON = envBoolean.parse(process.env.GEMINI_DEBUG_JSON);

/* sanitizeValue:
- protege logs contra objetos demasiado grandes
- limita tamanho de strings e arrays
- evita outputs difíceis de ler no terminal
*/

/* ********** Comentário para apagar ************
 As respostas do Gemini trazem objetos gigantescos, cheios de metadados internos da Google que não interessam. O método sanitizeValue corta strings longas e arrays gigantes automáticos, deixando no terminal apenas o que é estritamente legível para um ser humano.
 */
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

  /* PARA GRAVAR EM FICHEIRO "app.log": (*descomentar import fs e as linhas abaixo e apagar o resto:

  let logOutput = '';

  // Monta o texto que vai ser gravado (em formato JSON ou texto limpo)
  if (DEBUG_LOG_JSON) {
    logOutput = `[trip-debug] ${JSON.stringify(payload)}\n`;
  } else {
    const { timestamp, ...remainingPayload } = payload;
    const formattedDetails = formatDebugValue(remainingPayload, 1).split('\n').map((line) => `  ${line}`).join('\n');
    logOutput = `\n🤖 [${timestamp}] [${scope} -> ${event}]:\n${formattedDetails}\n`;
  }

  // O Node.js escreve ou adiciona o texto diretamente num ficheiro local chamado 'app.log'
  try {
    fs.appendFileSync('app.log', logOutput, 'utf8');
  } catch (fileError) {
    console.error('Falha ao gravar no ficheiro de logs:', fileError);
  }

  // Se também quiser continuar a ver os logs no ecrã do terminal ao mesmo tempo:
  if (!DEBUG_LOG_JSON) {
    console.log(logOutput);
  }
}
    */

  if (DEBUG_LOG_JSON) {
    console.log('[trip-debug]', JSON.stringify(payload));
    return;
  }

  const { timestamp, ...remainingPayload } = payload;
  const formattedDetails = formatDebugValue(remainingPayload, 1).split('\n').map((line) => `  ${line}`).join('\n');
  
  // Log formatado para melhor leitura humana no terminal
  console.log(`\n🤖 [${timestamp}] [${scope} -> ${event}]:\n${formattedDetails}`);
}
