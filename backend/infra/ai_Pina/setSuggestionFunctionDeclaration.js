import {Type } from '@google/genai';

// Define a function that the model can create task 
export const setAiSuggestionFunctionDeclaration = {
name: 'set_ai_suggestion',
description: 'Sets to create a trip suggestion',
"parameters": {
      "type": "object",
      "properties": {
        "trip_id": {
          "type": "integer",
          "description": "ID da viagem."
        },
        "title": {
          "type": "string",
          "description": "Título da sugestão."
        },
        "content": {
          "type": "string",
          "description": "Conteúdo detalhado da sugestão."
        }
      },
      "required": [
        "title",
        "content"
      ]
    }
  }


