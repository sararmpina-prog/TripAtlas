/*
Responsável por:
    - extrair texto final
    - trim
    - devolver formato { success, message }
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
    message: finalText,
  };
}
