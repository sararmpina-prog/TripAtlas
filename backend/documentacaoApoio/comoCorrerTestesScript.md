num terminal, arrancar o backend com `npm start` dentro de backend/package.json
noutro terminal, correr `npm run test:crud`
para validar só isolamento de utilizadores, correr `npm run test:ownership`
Se o backend estiver noutra URL/porta, também pode fazer:

BASE_URL=http://localhost:3000 npm run test:crud
BASE_URL=http://localhost:3000 npm run test:ownership
P