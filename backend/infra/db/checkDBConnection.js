/*
Função para verificar a conexão com a base de dados antes de iniciar o servidor;
Tenta executar uma query simples (SELECT 1) para garantir que a conexão está a funcionar;
Se a conexão falhar, mostra o erro na console.log e encerra o processo para evitar que o servidor inicie sem acesso ao banco.
Está a ser chamado no app.js durante a inicialização do servidor.
*/

import { db } from './db.js';

export const checkDBConnection = async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ Database OK");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

