/* Configuração do Assistente TripAtlas para integração com a Gemini.

Objetivo:
Isolar toda a configuração específica do agente, da camada genérica de comunicação com a AI.

Diferença de responsabilidades:
- callGemini.js → comunicação com SDK da Gemini
- tripBotConfig.js → comportamento do agente
*/

import {buildTripAssistantSystemPrompt} from '../ai/prompts/tripAssistantPrompt.js'
import {setAiSuggestionFunctionDeclaration} from './tools.js'

export const TRIPBOT_TEMPERATURE = 0.4; // Ligeiramente criativo para boas sugestões de viagem

export function buildTripBotConfig(systemInstruction, config = {}) {
  return {
    temperature: TRIPBOT_TEMPERATURE,
<<<<<<< HEAD:backend/infra/ai/config/tripAssistantConfig.js
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
=======
    systemInstruction, // Injeta as regras estruturadas e o contexto da BD
    ...config, // Permite passar configurações adicionais e o suporte para sobrescrever parâmetros
>>>>>>> main:backend/infra/ai/tripBotConfig.js
  };
}


//Create config 
export const config = {

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
