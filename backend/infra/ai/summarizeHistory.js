



let summary = null;

export async function summarizeHistory(history) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [
      ...history,
      {
        role: "user",
        parts: [{
          text: `
      Resume esta conversa mantendo apenas:

      - intenções do utilizador
      - decisões tomadas
      - tarefas em curso
      - informação importante para continuar

      Não inventes nada.
      `
              }]
            }
          ]
        });

  return response.candidates[0].content.parts[0].text;
}