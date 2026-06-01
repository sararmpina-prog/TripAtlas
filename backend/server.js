import express from 'express';
import accommodationRoutes from './routes/accommodationRoutes.js'
import reserveRoutes from './routes/reserveRoutes.js'

const app = express();


const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TripAtlas backend online.',
  });
});

app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reserves', reserveRoutes);

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
