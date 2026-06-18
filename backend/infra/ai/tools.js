/* Camada de definição de tools (function calling) do TaskBot.

  Arquitetura:

  A implementação de function calling foi separada em módulos para evitar:
  - mistura de IA com lógica de negócio (SQL / validação / services)
  - acoplamento entre parsing da resposta e execução de ações
  - duplicação de configuração da Gemini

  Fluxo completo do system:

  1. tools são declaradas aqui (schema de inputs)
  2. são injetadas em taskBotGeminiConfig.js via functionDeclarations
  3. callGemini.js envia tools para a Gemini
  4. resposta contém functionCall
  5. taskBotReplyService.js extrai functionCall
  6. taskBotService.js executa loop de tools
  7. backend constrói manualmente functionResponse

  Importante:
  - a Gemini NÃO executa nada diretamente
  - apenas sugere ações estruturadas
  - toda execução é controlada pelo backend
 */

import { Type } from '@google/genai';

// Tools divididas por funcionalidade - facilita organização e manutenção;

 /* Tool de criação de tarefas.

O modelo apenas sugere os parâmetros.
A validação e persistência são responsabilidade do backend.
 */