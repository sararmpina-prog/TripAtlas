/* Camada de infraestrutura responsável pela comunicação com a Gemini.

Responsabilidades:
- comunicar diretamente com a API da Gemini
- validar configuração e inputs base
- executar retries e fallbacks de modelo
- normalizar extração de respostas
- devolver texto bruto ao restante sistema

Importante:
Esta camada NÃO gere histórico conversacional nem regras de negócio.

A gestão de memória/histórico pertence aos services da aplicação,
mantendo a separação entre:
- infraestrutura AI
- contexto conversacional
- lógica de negócio

Esta função não conhece tarefas, SQL ou entidades da aplicação.
Fluxo esperado:
prompt/contents -> Gemini -> texto
*/

