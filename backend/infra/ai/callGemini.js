/* Camada genérica de comunicação com a Gemini.

Responsabilidades:
- validar configuração base
- executar chamadas ao provider utilizando o SDK oficial @google/genai
- aplicar retry/fallback de modelos
- devolver texto ou resposta bruta

Esta camada não conhece prompts, tools nem comportamento específico do assistente.
*/

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import {buildTripAssistantSystemPrompt} from './prompts/tripAssistantPrompt.js'
import {setAiSuggestionFunctionDeclaration} from './setSuggestionFunctionDeclaration.js'
import {createAiSuggestion} from './createAiSuggestion.js'
import { logGeminiDebug } from './aiDebugLogger.js';
import {isTransientGeminiError,formatAIError} from './aiErrorMapper.js'
import {
  summarizeHistory
} from './summarizeHistory.js';


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

let summary = null;


//Call Api Gemini (multiple function definitions)
export async function callGemini(userPrompt, trip_id = null, user_id) {


 history.push({
      role: "user",
      parts: [{ text: userPrompt }]
  });

  logGeminiDebug('function-calling', 'initial-context-built', {
    history,
    historySize: history.length,
    userPrompt
  });

  try {


let currentResponse = await generateWithFallback(history, config);

  logGeminiDebug(
  'function-calling',
  'gemini-response',
  { currentResponse }
);

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


  logGeminiDebug(
    'function-calling',
    'history-after-model-push',
    {
      lastModelParts: parts,
      historyLength: history.length,
      lastEntry: history[history.length - 1]
    }
  );


  //Filtra array, elementos que tem functionCall e depois transforma cada objeto no valor dessa propriedade functionCall
  const functionCalls = parts.filter(p => p.functionCall).map(p => p.functionCall)

  console.log("functionCalls =", functionCalls);

  logGeminiDebug('function-calling', 'function-calls', {
        step,
        functionCalls
      });


 //Se não existir, sai do loop 
 if (functionCalls.length == 0) { break}

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

    logGeminiDebug(
  'function-calling',
  'executing-function',
  {
    functionName: fn.name,
    args: fn.args,
    trip_id
  }
);

    switch (fn.name) {
      case 'create_trip_journal_entry':
        result = await createAiSuggestion({...fn.args, trip_id});
        break;

      default:
      result = { error: 'Unknown function' };
    }

    logGeminiDebug(
  'function-calling',
  'function-executed',
  {
    functionName: fn.name,
    result
  }
);

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

      if (history.length > 20) {

        const oldHistory = history.slice(0, -10);
        const recent = history.slice(-10);

        summary = await summarizeHistory(oldHistory);

        history = [
          {
            role: "user",
            parts: [{
              text: "Resumo da conversa anterior:\n" + summary
            }]
          },
          ...recent
        ];
      }

      
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

  logGeminiDebug(
  'function-calling',
  'final-response',
  {
    finalText
  }
);

  if (finalText) {
    finalText = finalText?.trim()
  }



  const finalResponse = {
      success: true,
      message: finalText
    
    };

    return finalResponse
 
      
} catch (error) {

 logGeminiDebug(
  'function-calling',
  'gemini-error',
  {
    message: error.message,
    response: error.response?.data,
    stack: error.stack
  }
);

  throw error
    }
  }








// Go through models: Best - gemini-2.5-flash + gemini-3.1-flash-lite

async function generateWithFallback(contents, config) {

  let lastError = null;

  for (let i = 0; i < GEMINI_MODELS.length; i++) {

    const model = GEMINI_MODELS[i];

    try {

      logGeminiDebug(
        'gemini-provider',
        'model-attempt',
        {
          model,
          attempt: i + 1
        }
      );

      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });

      logGeminiDebug(
        'gemini-provider',
        'model-success',
        {
          model
        }
      );

      return response;

    } catch (error) {

      logGeminiDebug(
        'gemini-provider',
        'model-failure',
        {
          model,
          transient: isTransientGeminiError(error),
          formattedMessage: formatAIError(error),
          originalMessage: error.message
        }
      );

      // Modelo inexistente -> tenta o próximo
      if (
        error.status === 404 ||
        formatAIError(error).includes('configured Gemini model')
      ) {

        logGeminiDebug(
          'gemini-provider',
          'fallback-next-model',
          {
            failedModel: model
          }
        );

        continue;
      }

      lastError = error;
    }
  }

  logGeminiDebug(
    'gemini-provider',
    'all-models-failed',
    {
      modelsTried: GEMINI_MODELS,
      finalError: formatAIError(lastError)
    }
  );

  throw new Error(
    formatAIError(lastError)
  );
}

