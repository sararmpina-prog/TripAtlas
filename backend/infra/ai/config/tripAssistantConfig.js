/* Configuração do Assistente TripAtlas para integração com a Gemini.

Objetivo:
Isolar toda a configuração específica do agente, da camada genérica de comunicação com a AI.

Diferença de responsabilidades:
- callGemini.js → comunicação com SDK da Gemini
- tripBotConfig.js → comportamento do agente
*/

import {buildTripAssistantSystemPrompt} from './tripAssistantPrompt.js'
import {setAiSuggestionFunctionDeclaration} from './tools.js'

export const TRIPBOT_TEMPERATURE = 0.4; // Ligeiramente criativo para boas sugestões de viagem

export function buildTripBotConfig(systemInstruction, config = {}) {
  return {
    temperature: TRIPBOT_TEMPERATURE,
    systemInstruction, // Injeta as regras estruturadas e o contexto da BD
    ...config, // Permite passar configurações adicionais e o suporte para sobrescrever parâmetros
  };
}


//Create config 
export const config = {
  temperature: TRIPBOT_TEMPERATURE,
  systemInstruction: buildTripAssistantSystemPrompt(),

  tools: [
      {
          functionDeclarations: [
              setAiSuggestionFunctionDeclaration
          ]
      }
  ],

  toolConfig: {
      functionCallingConfig: {
          mode: 'AUTO'
      }
  }
}; 
