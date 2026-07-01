
# TRIPATLAS

Trabalho realizado por:
Leonor Pereira: upskill228@alunos.ciencias.ulisboa.pt
Sara Pina: upskill226@alunos.ciencias.ulisboa.pt

Repositório GitHub link: https://github.com/sararmpina-prog/TripAtlas.git


## Instalações backend:
new terminal
cd backend
npm install
npm run dev


## Instalações frontend:
new terminal
cd frontend
npm install
npm run dev 

Deverá aparecer local:  http://localhost:XXXX/

Extras:
As dependências (incluindo react-icons e react-markdown) já estão no package.json de cada pasta.
Basta correr npm install em backend e frontend.


## Scripts úteis

Backend:
- npm run dev
- npm start
- npm run test:crud
- npm run test:ownership

Frontend:
- npm run dev
- npm run build
- npm run preview


## Variáveis de ambiente (backend)

Criar um ficheiro .env na pasta backend com:

PORT=3000
DB_HOST=localhost
DB_USER=teu_user
DB_PASSWORD=tua_password
DB_NAME=tripatlas
DB_PORT=3306
JWT_SECRET=uma_chave_forte
GEMINI_API_KEY=chave_gemini_opcional


## Organização do Projeto

O projeto foi dividido em duas subpastas como identificado acima: pasta backend e pasta frontend.

Em backend temos a seguinte arquitetura: 
controllers
cocumentacaoApoio
infra
middlewares
repository
routes
services
testes
utils
validators
- app.js
- server.js

Considerações adicionais sobre a arquitetura backend:
 - As subpastas routes, controllers e services seguem a mesma estrutura trabalhada em aula. Nestas apresentamos as diferentes entidades do nosso projeto (flight, reserves, accomodations, suggestions, trips, user). Com a adição de ficheiros destinados à autenticação (authRoutes, authcontroller e authService) e ao chatBot (aiRoutes, chatController e chatService)

- A pasta repositório apresenta tudo o que é destinado à ligação com a base de dados ou seja todos as queries de pedido à BD. 

- A pasta infra, agrega duas subpastas. Na primeira **ai** temos todos os ficheiros destinados à criação do chat Bot. A **db** condiciona tudo o que é relativo à criação da nossa BD (criação de tabelas, atualizações e inserção de valores).

- Optamos por usar Zod Schema para validar a estutura das diferentes entidades que ficou guardado em **validators**. 

- As pastas documentacaoApoio e testes são destinadas a nós, utilizadas durante o desenvolvimento da aplicação e reunem informação de teste durante o deployment das funcionalidades. 



Em frontend temos a seguinte arquitetura: 
api
assets
auth
components
context
layouts
pages
styles
utils
validators
- api.js
- App.css
- dashboard.js
- index.css
- main.jsx
- index.html



Considerações adicionais sobre a arquitetura frontend:
 - As subpastas seguem uma lógica modular e de separação de conceitos, garantindo que a interface gráfica está isolada das regras de validação e das chamadas diretas à API.

 - **api**: Contém as configurações / endpoints de comunicação assíncrona com o servidor Node.js, centralizando os cabeçalhos de autenticação (Bearer Token) num único fluxo.

 - **components**: Agrega todos os componentes atómicos e modais reutilizáveis do projeto (ex: `Header`, `DashboardCard`, `SubmitButton`, `PasswordField`, `FlightSegmentForm`, `ReserveForm`, entre outros). Esta modularidade permitiu construir um Design System consistente em toda a plataforma.

 - **context**: Implementa o gerenciamento de estados globais reativos através da **React Context API**. Destacam-se o `ToastContext` (responsável pelo disparo de alertas flutuantes e efémeros de sucesso em qualquer ecrã) e o `ConfirmContext` (responsável pelos modais de confirmação críticos e irreversíveis, como a eliminação de dados e fecho de conta).

 - **layouts**: Define as estruturas de esqueleto visual para as páginas protegidas e para as páginas públicas

 - **pages**: Aloja os ecrãs principais do fluxo da aplicação (ex: `Login`, `Register`, `Dashboard`, `EditProfile`), atuando como os "maestros" que coordenam a lógica de negócio e distribuem as informações para os subcomponentes.

 - **styles**: Centraliza o código CSS do projeto. Adota uma estratégia modular onde cada componente pai (ficheiro index) injeta os seus respetivos estilos em cascata. O ficheiro `global.css` tranca as variáveis de raiz (`:root`), palete de cores do TripAtlas, tipografia e botões.

 - **utils**: Agrega funções utilitárias auxiliares puras, como manipuladores de datas (`dateHelpers`), armazenamento e persistência de sessão nos storages do browser (`authStorage.js`) e comparadores de dados geométricos de inputs (`formhelpers`).

 - **validators**: Concentra as regras síncronas de validação local de formulários e mapeamento de mensagens de erro inline no frontend. O ficheiro `apiValidator.js` faz a ponte reativa com os erros estruturados do Zod vindos do backend, iluminando a vermelho o input exato onde o utilizador errou.

### Outros pontos globais a mencionar:

1. **Gestão de Estado Assíncrono com TanStack Query (React Query)**:
   * **Caching Inteligente**: Toda a leitura de dados (`Trips`, `Flights`, `Reserves`, `Journal`) usa ganchos `useQuery` automáticos. Os dados mantêm-se em cache e só fazem um novo pedido se detetarem alterações.
   * **Mutações Robustas**: As escritas, atualizações e eliminações usam `useMutation`. Em caso de sucesso, é feito o `invalidateQueries` da cache, forçando o React a redesenhar o ecrã instantaneamente e com transições fluidas, sem necessidade de recarregar a página inteira (SPA).

2. **Otimizações de UX e Performance**:
   * **Preloading Estático**: O ecrã de registo e login faz o *preload* preventivo de imagens pesadas através de eventos `onMouseEnter` e `onTouchStart` nos links, antecipando a navegação do utilizador.
   * **Botões Reativos Dinâmicos**: O componente `SubmitButton` calcula em tempo real se o formulário sofreu alguma alteração. Se os campos estiverem em branco ou idênticos aos dados originais da API, desativa-se para poupar chamadas inúteis ao servidor.
   * **Inteligência por Palavra-Chave (AI Bridge)**: O frontend liga-se de forma assíncrona ao assistente da Gemini. Se o utilizador conversar com o robô e pedir para guardar uma sugestão no Diário, o repositório do backend analisa o texto enviado por aproximação (`LIKE`), corrige o ID da viagem e atualiza a interface reativamente.


