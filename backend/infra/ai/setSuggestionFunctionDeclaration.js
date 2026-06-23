
// Define a function that the model can create task 
export const setAiSuggestionFunctionDeclaration = {
name: 'create_trip_journal_entry',
description: `
Save a travel suggestion into the user's trip journal.

Use this function ONLY when the user explicitly asks
to save, store, add, create, register or persist
a suggestion in their trip journal.

Do NOT use this function when the user is only asking
for recommendations or travel advice.
`,
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


