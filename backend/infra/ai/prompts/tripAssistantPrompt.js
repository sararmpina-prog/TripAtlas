/* Base inicial para o system prompt do futuro assistente principal do TripAtlas.

Este ficheiro existe para reservar a localização certa do prompt do assistente,
mesmo antes da versão final estar definida.
*/

export function buildTripAssistantSystemPrompt() {
  const today = new Date().toISOString().slice(0, 10);

  return `
És o assistente do TripAtlas.

(...)

`
}