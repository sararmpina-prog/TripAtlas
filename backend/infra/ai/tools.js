
/* Camada de definição de tools (function calling) do TripBot.

  Arquitetura:

  A implementação de function calling foi separada em módulos para evitar:
  - mistura de IA com lógica de negócio (SQL / validação / services)
  - acoplamento entre parsing da resposta e execução de ações
  - duplicação de configuração da Gemini

  Fluxo completo do system:

  1. tools são declaradas aqui (schema de inputs)
  2. são injetadas no ficheiro Config.js via functionDeclarations
  3. callGemini.js envia tools para a Gemini
  4. resposta contém functionCall
  5.ReplyService (nome ainda provisorio) extrai functionCall
  6. Service.js executa loop de tools
  7. backend constrói manualmente functionResponse

  Importante:
  - a Gemini NÃO executa nada diretamente
  - apenas sugere ações estruturadas
  - toda execução é controlada pelo backend
 */


// Tools divididas por funcionalidade - facilita organização e manutenção;

 /* Tool de criação de ...

O modelo apenas sugere os parâmetros.
A validação e persistência são responsabilidade do backend.
 */


// Define a function that the model can create task 
export const setAiSuggestionFunctionDeclaration = {
  name: 'create_trip_journal_entry',
  description: `
      Save a travel suggestion into the user's trip journal.

      Use this function ONLY when the user explicitly asks to save, store, add, create, register or persist a suggestion in their trip journal.

      Do NOT use this function when the user is only asking for recommendations or travel advice.
  `,
  parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A concise, appropriate title for the journal entry."
          },
          content: {
            type: "string",
            description: "The full detailed content of the travel recommendation to be stored."
          },
          trip_reference: {
            type: "string",
            description: "A natural reference provided by the user to identify the trip, such as the trip title, destination, trip ID, or another identifier."
          }
        },
<<<<<<< HEAD:backend/infra/ai/config/tools.js
        required: [
          "title",
          "content",
          "trip_reference"
        ]
      }
    };
=======
        "title": {
          "type": "string",
          "description": "Título da sugestão."
        },
        "content": {
          "type": "string",
          "description": "Conteúdo simples da sugestão."
        },
        "trip_name": {
          "type": "string",
          "description": "Título da viagem."
        },
          "user_id": {
          "type": "integer",
          "description": "ID do utilizador."
        }
      },
      "required": [
       "trip_name",
        "title",
        "content"
      ]
    }
  }

>>>>>>> main:backend/infra/ai/tools.js

