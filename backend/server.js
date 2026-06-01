/* Ficheiro cuja função é ler as configurações, testar a ligação e a estrutura da base de dados (garantindo que o schema existe) e, se tudo estiver correto, ligar o servidor.
*/

import app from './app.js';
import { ensureTripAtlasSchema, hasDatabaseConfig } from './infra/db/db.js';
import { checkDBConnection } from './infra/db/checkDBConnection.js';

const port = Number(process.env.PORT) || 3000;

async function startServer() {
  // Inicialização Segura da Base de Dados antes do Express escutar pedidos
  if (hasDatabaseConfig()) {
    await checkDBConnection();
    await ensureTripAtlasSchema();
  } else {
    console.warn('⚠️ DB config ausente. O servidor arranca sem inicializar a base de dados.');
  }

  // Ativa o servidor HTTP
  app.listen(port, () => {
    console.log(`Servidor a executar em http://localhost:${port}`);
  });
}

// Executa o arranque capturando falhas críticas imprevistas
startServer().catch((error) => {
  console.error('Falha crítica ao iniciar o servidor:', error);
  process.exit(1);
});
