import express from 'express';
import tripRoutes from './routes/tripRoutes.js';
import { ensureTripAtlasSchema, hasDatabaseConfig } from './infra/db/db.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { checkDBConnection } from './infra/db/checkDBConnection.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

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


app.use('/api/trips', tripRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  if (hasDatabaseConfig()) {
    await checkDBConnection();
    await ensureTripAtlasSchema();
  } else {
    console.warn('DB config ausente. O servidor arranca sem inicializar a base de dados.');
  }

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Falha ao iniciar o servidor:', error);
  process.exit(1);
});