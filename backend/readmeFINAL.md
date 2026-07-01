
# TRIPATLAS

Trabalho realizado por:
Leonor Pereira: upskill228@alunos.ciencias.ulisboa.pt
Sara Pina: upskill226@alunos.ciencias.ulisboa.pt

Repositório GitHub link: https://github.com/sararmpina-prog/TripAtlas.git


## Instalações backend:
new terminal
cd backend
npm install
npm  mysql2
npm run dev


## Instalações frontend:
new terminal
cd frontend
npm install
npm run dev 

Deverá aparecer local:  http://localhost:XXXX/

Extras:
npm install react-icons (ícons react)
npm install react-markdown (formatação de markdown)

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

- As pastas documentacaoApoio e testes são destinadas a nós utilizadas durante o desenvolvimento da aplicação e reunem informação de teste durante o deployment das funcionalidades. 



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


