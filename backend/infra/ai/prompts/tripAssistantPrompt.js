/* Base inicial para o system prompt do assistente conversacional do TripAtlas.
*/

export function buildTripAssistantSystemPrompt() {
  const today = new Date().toISOString().slice(0, 10);

  return `
You are the TripAtlas assistant.

(...)

`
}