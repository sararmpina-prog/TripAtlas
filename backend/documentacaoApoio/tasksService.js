/* 
Task service = execução

Aqui existe a lógica de negócio:

- constrói o prompt para a Gemini
- chama callGemini(...)
- limpa a resposta
- faz JSON.parse(...)
- devolve já um objeto JavaScript pronto a usar */

import { callGemini } from '../infra/ai/callGemini.js';
import { parseAIJsonResponse } from '../utils/aiResponseParser.js';

// ----- createTaskFromText -----
export async function createTaskFromText(text) {
  const prompt = `
  Converte o texto seguinte numa tarefa estruturada.

  Formato obrigatório:
  {
    "title": string,
    "description": string,
    "priority": "low" | "medium" | "high",
    "tags": string[]
  }

  Regras:
  - Não inventes informação que não esteja no texto
  - Mantém o título curto (máx. 8 palavras)
  - A prioridade deve refletir urgência implícita no texto
  - Tags devem ser simples e em minúsculas

  Devolve apenas JSON válido.

  Se não conseguires cumprir o formato, devolve:
  { "error": "invalid_output" }

  Texto: ${text}
`;

  const responseText = await callGemini(prompt, 'gemini-2.5-flash');
  return parseAIJsonResponse(responseText);
}

// ----- refineTask -----
export async function refineTask(task) {
  const prompt = `
  Melhora a seguinte tarefa.

  Formato obrigatório:
  {
    "title": string,
    "description": string,
    "priority": "low" | "medium" | "high",
    "tags": string[]
  }

  Regras:
  - Torna o título mais claro e específico (máx. 10 palavras)
  - Expande a descrição com contexto útil, sem inventar dados
  - Mantém ou ajusta a prioridade se necessário
  - Garante que as tags são relevantes e em minúsculas

  Devolve apenas JSON válido.

  Se não conseguires cumprir o formato, devolve:
  { "error": "invalid_output" }

  Tarefa: ${JSON.stringify(task)}
`;

  const responseText = await callGemini(prompt, 'gemini-2.5-flash');
  return parseAIJsonResponse(responseText);
}

// ----- summarizeTask -----
export async function summarizeTask(description) {
  const prompt = `
  Resume a seguinte descrição numa única frase clara e objetiva.

  Formato obrigatório:
  {
    "summary": string
  }

  Regras:
  - Máximo 20 palavras
  - Não adicionar informação nova

  Devolve apenas JSON válido.

  Se não conseguires cumprir o formato, devolve:
  { "error": "invalid_output" }

  Descrição: ${description}
`;

  const responseText = await callGemini(prompt, 'gemini-2.5-flash');
  return parseAIJsonResponse(responseText);
}

// ----- suggestTags -----
export async function suggestTags(task) {
  const prompt = `
  Sugere tags para a seguinte tarefa.

  Formato obrigatório:
  {
    "tags": string[]
  }

  Regras:
  - Entre 3 a 6 tags
  - Tags devem ser:
    - curtas (1 a 2 palavras)
    - em minúsculas
    - sem espaços desnecessários
  - Evita duplicados
  - Baseia-te apenas na informação fornecida

  Devolve apenas JSON válido.

  Se não conseguires cumprir o formato, devolve:
  { "error": "invalid_output" }

  Tarefa: ${JSON.stringify(task)}
`;
  const responseText = await callGemini(prompt, 'gemini-2.5-flash');
  return parseAIJsonResponse(responseText);
}

// ----- classifyPriority -----
export async function classifyPriority(description) {
  const prompt = `
  Classifica a prioridade de uma tarefa com base na urgência.

  Exemplos:
  Input: "site caiu"
  Output: { "priority": "high" }

  Input: "mudar botão"
  Output: { "priority": "medium" }

  Input: "trocar favicon"
  Output: { "priority": "low" }

  Agora classifica:

  Input: "${description}"

  Formato obrigatório:
  {
    "priority": "low" | "medium" | "high"
  }

  Devolve apenas JSON válido.

  Se não conseguires cumprir o formato, devolve:
  { "error": "invalid_output" }

  `;
  const responseText = await callGemini(prompt, 'gemini-2.5-flash');
  return parseAIJsonResponse(responseText);
}

// ----- generateNames -----
export async function generateNames(temperature) {
  const prompt = `
Gera 5 nomes criativos para uma aplicação de produtividade.

Regras:
- Usa português ou inglês
- Nomes curtos (máx. 2 palavras)
- Evita nomes genéricos

Devolve apenas JSON válido:
{
  "names": string[]
}

Se não conseguires cumprir o formato, devolve:
  { "error": "invalid_output" }
`;

  const responseText = await callGemini(prompt, 'gemini-2.5-flash', {
    temperature,
  });

  return parseAIJsonResponse(responseText);
}

// ----- planSprint -----
export async function planSprint(tasks) {
  const prompt = `
  Organiza um sprint de 5 dias para lançar uma landing page.

  Tarefas:
  ${JSON.stringify(tasks)}

  Objetivo:
  - Planear a execução ao longo de 5 dias
  - Garantir ordem lógica entre tarefas
  - Definir prioridades

  Regras:
  - Agrupa tarefas por dia (Dia 1 a Dia 5)
  - Respeita dependências
  - Prioriza tarefas críticas
  - Mantém descrições curtas

  Formato obrigatório (JSON):
  {
    "sprint": [
      {
        "day": number,
        "tasks": [
          {
            "title": string,
            "priority": "low" | "medium" | "high"
          }
        ]
      }
    ]
  }

  Devolve apenas JSON válido.

  Se não conseguires cumprir o formato, devolve:
  { "error": "invalid_output" }
  `;

const responseText = await callGemini(prompt, 'gemini-2.5-flash');
  return parseAIJsonResponse(responseText);
}

