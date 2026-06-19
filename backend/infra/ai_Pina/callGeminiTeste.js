import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import {buildTripAssistantSystemPrompt} from '../ai/prompts/tripAssistantPrompt.js'
import {setAiSuggestionFunctionDeclaration} from './setSuggestionFunctionDeclaration.js'
import {createAiSuggestion} from './createAiSuggestion.js'


// History general starts off as a empty array
let history = [];

console.log("Chave carregada:", process.env.GEMINI_API_KEY ? "SIM" : "NÃO");
// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}


//Different models available
const GEMINI_MODELS = [
  //  "gemini-3.1-pro",
    "gemini-2.5-pro",
    "gemini-3-flash",
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2-flash",
    "gemini-2-flash-lite",
    "gemini-2.5-flash-lite"
];


// Initialize Gemini AI (same as working code)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY 
});


//Create config 
const config = {

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


//Call Api Gemini (multiple function definitions)
export async function callGeminiWithFunctionDefinition(userPrompt, trip_id = null) {

  history.push({
      role: "user",
      parts: [{ text: userPrompt }]
  });

  console.log("Histórico da conversa (primeiro push)", history)
  console.log("Histórico:", JSON.stringify(history, null, 2))

  try {

  let currentResponse = await generateWithFallback(history, config);

  console.log(JSON.stringify(currentResponse, null, 2));

  let step = 1;
  const MAX_STEPS = 5;

  while ( step <= MAX_STEPS) {

  const parts = currentResponse?.candidates?.[0]?.content?.parts || [];

  console.log("parts =", parts)

  if (parts && parts.length > 0) {
  console.log("parts existe e length maior que zero")  
  history.push({
    role: "model",
    parts
  });
}

  console.log("Histórico da conversa (resposta Gemini)", history)
  console.log("Histórico:", JSON.stringify(history, null, 2))

  console.log("parts", parts)
  console.log(`🔁 STEP ${step}`);
  console.log("Funções pedidas pelo modelo:");

  //Filtra array, elementos que tem functionCall e depois transforma cada objeto no valor dessa propriedade functionCall
  const functionCalls = parts.filter(p => p.functionCall).map(p => p.functionCall)


  console.log("functionCalls", functionCalls)

 //Se não existir, sai do loop 
 if (functionCalls.length == 0) {

    break
    }

    // Mostrar chamadas
   currentResponse.functionCalls.forEach(fn => {
    console.log(`➡️ ${fn.name}`, fn.args);
  });
  

/*
 * ================================
 * 5. EXECUTAR FUNÇÕES (SIMULAÇÃO)
 * ================================
 */
    const functionResults = await Promise.all(currentResponse.candidates[0].content.parts
    .filter(p => p.functionCall)
    .map(async (p) => {

    const fn = p.functionCall;  
    let result;

    console.log("FUNCTION ARGS:", JSON.stringify(fn.args, null, 2));

    console.log("Trip ID recebido:", trip_id);
    console.log("Function args:", fn.args);

    switch (fn.name) {
      case 'set_ai_suggestion':
        result = await createAiSuggestion({...fn.args, trip_id});
        break;

      default:
      result = { error: 'Unknown function' };
    }

    console.log(`✅ Executada: ${fn.name}`, result);

    return {
      name: fn.name,
      response: result ?? {},
      thought_signature: fn.thought_signature
    };
  }));

      // Adicionar function responses ao histórico
      const toolMessage = {
        role: "tool",
        parts: functionResults.map(fr => ({
          functionResponse: {
            name: fr.name,
            response:  fr.response  ?? {}
          }
        }))};

      history.push(toolMessage);

      console.log("Histórico da conversa (resposta Gemini execução funções)", history)
      console.log("Histórico:", JSON.stringify(history, null, 2))
      

  // Pedir próxima resposta ao Gemini
  currentResponse = await generateWithFallback(history, config);
    step++;
    console.log("currentResponse", currentResponse) 
  }

  
  const finalParts =
  currentResponse?.candidates?.[0]?.content?.parts || [];

  console.log("final parts", finalParts)

  let finalText =
  finalParts.find(p => p.text)?.text;

  console.log("finalText", finalText)

  if (finalText) {
    finalText = finalText?.trim()
  }

  console.log("Histórico da conversa (resposta FINALISSIMO)", history)
  console.log("Histórico:", JSON.stringify(history, null, 2))


  console.log("isto são os textos", finalText)

  

  const finalResponse = {
      success: true,
      message: finalText
    
    };
    console.log("finalResponse", finalResponse)
    return finalResponse
 
      
} catch (error) {

  console.error(
      "Gemini API Error:",
      error.response?.data || error
  );

  throw error
    }
  }



//Go through models: Best - gemini-2.5-flash + gemini-3.1-flash-lite 
async function generateWithFallback(contents, config) {

  let lastError = null;

  for (let i = 0; i < GEMINI_MODELS.length; i++) {
    let model = GEMINI_MODELS[i];

    try {
    console.log("A tentar modelo:", model);

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: config
    });

    console.log("Sucesso com modelo:", model);

    return response; 

 } catch (error) {

  console.warn("Modelo falhou porque", error.message);

  if (error.status === 404) {
  console.log("Modelo não existe, a continuar...");
  continue;
}

  lastError = error;
}}
  throw lastError;
  }



