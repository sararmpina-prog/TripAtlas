import express from 'express';
import tripRoutes from './routes/tripRoutes.js';
import accommodationRoutes from './routes/accommodationRoutes.js'
import accommodationReserveRoutes from './routes/accommodationReserveRoutes.js'

const app = express();


const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TripAtlas backend online.',
  });
});

app.use('/api/trips', tripRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reserves', accommodationReserveRoutes);

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
