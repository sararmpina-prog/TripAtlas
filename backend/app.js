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
import authRoutes from './routes/authRoutes.js'; // Adicionado para o fluxo de Login / Registo
import tripRoutes from './routes/tripRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import userRoutes from './routes/userRoutes.js';
import accommodationRoutes from './routes/accommodationRoutes.js'
import reserveRoutes from './routes/reserveRoutes.js'
// mport aiRoutes from './routes/aiRoutes.js'; // Rota para o agente conversacional da Gemini

// Middlewares
import auth from './middlewares/authMiddeware.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { hasDatabaseConfig } from './infra/db/db.js';

const app = express();

// Middlewares Globais
app.use(express.json());
// Origem do CORS deve ser ajustada para bater certo com o Live Server do frontend
app.use(cors({ origin: 'http://127.0.0.1:5500' })); 

// Endpoints Base e Health Check (são rotas públicas, não precisam de autenticação)
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

// O fluxo de autenticação TEM de ser público para permitir Login/Registo
app.use('/api/auth', authRoutes); 

// ROTAS PROTEGIDAS (Só entram utilizadores autenticados - Só executam SE passarem pela barreira acima "'/api/auth', authRoutes")

// app.use('/api/ai', aiRoutes); - ******* TIRAR COMENTARIO QUANDO A ROTA DE AI ESTIVER PRONTA *******
app.use('/api/trips', auth, tripRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reserves', reserveRoutes);
app.use('/api', authRoutes); 

// Tratamento de Erros (Sempre no fim)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
