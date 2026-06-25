/* Responsável por:
 *  - extrair o texto final da resposta Gemini
 *  - normalizar com trim
 *  - devolver no formato { success, message } esperado pelo chatService
 */

export function buildFinalResponseFromGemini(currentResponse) {
  const finalParts = currentResponse?.candidates?.[0]?.content?.parts || [];

  console.log('final parts', finalParts);

  let finalText = finalParts.find((p) => p.text)?.text;

  console.log('finalText', finalText);

  if (finalText) {
    finalText = finalText?.trim();
  }

  return {
    success: true,
    // Se não houver texto (porque a IA só chamou uma tool), devolve uma string vazia ou mensagem padrão
    message: finalText || '', 
  };
}
