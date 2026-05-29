/* Ficheiro principal da aplicação Express. Configura middlewares globais, rotas base e endpoints de saúde, e atribui as rotas específicas de cada recurso.
Também inclui tratamento global de erros para garantir respostas consistentes em caso de falhas.

O app é exportado para ser utilizado pelo servidor (server.js) e para facilitar testes unitários e de integração.
*/

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente logo no início
dotenv.config();

// Rotas
import tripRoutes from './routes/tripRoutes.js';
import flightRoutes from './routes/flightRoutes.js'; // Nova rota incluída!

// Middlewares
import logger from './middlewares/loggerMiddleware.js'; // Reutilizado do projeto antigo
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { hasDatabaseConfig } from './infra/db/db.js';

const app = express();

// Middlewares Globais
app.use(express.json());
// Altere a origem do CORS para bater certo com o seu frontend se necessário
app.use(cors({ origin: 'http://127.0.0.1:5500' })); 
app.use(logger);

// Endpoints Base e Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TripAtlas backend online.',
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'tripatlas-backend',
    status: 'ok',
    databaseConfigured: hasDatabaseConfig(),
  });
});

// Atribuição de Rotas da API
app.use('/api/trips', tripRoutes);
app.use('/api/flights', flightRoutes); // Nova rota registada!

// Tratamento de Erros (Sempre no fim)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
