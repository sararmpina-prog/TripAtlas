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

// Esta função junta as ferramentas e o System Prompt com o userId real
export function buildTripBotConfig(userId = null, tripContext = {}, customConfig = {}) {
  return {
    temperature: TRIPBOT_TEMPERATURE,
    maxOutputTokens: 1000, // imita a resposta da IA a cerca de 4000 caracteres
    systemInstruction: buildTripAssistantSystemPrompt(tripContext, userId), 
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
    },
    ...customConfig, 
  };
}

// OBJETO ESTÁTICO
export const config = {
  temperature: TRIPBOT_TEMPERATURE,
  
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