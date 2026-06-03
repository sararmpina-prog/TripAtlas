/* Camada responsável pela comunicação com a BD.
   Base de dados → snake_case */

import { db } from '../infra/db/db.js';

// Mapeia as propriedades vindas do Service/Zod para as colunas reais do SQL da colega
const userFieldMap = {
  firstName: 'first_name',
  surname: 'surname',
  email: 'email',
  mobilePhone: 'mobile_phone',
  password: 'password_hash', // Corrigido para bater certo com a coluna da BD
};

// Função auxiliar para converter campos de camelCase para snake_case antes de enviar para a BD
function toDbFields(data) {
  const result = {};
  for (const [camel, snake] of Object.entries(userFieldMap)) {
    if (data[camel] !== undefined) {
      result[snake] = data[camel];
    }
  }
  return result;
}

// LISTA TODOS OS UTILIZADORES
export async function listUsers() {
  const [rows] = await db.execute(`
    SELECT 
      id, first_name, surname, email, mobile_phone, password_hash, created_at, updated_at 
    FROM users
  `);
  return rows;
}

// PROCURA UM UTILIZADOR PELO ID
export async function findUserById(id) {
  const [rows] = await db.execute(
    `
      SELECT 
        id, first_name, surname, email, mobile_phone, password_hash, created_at, updated_at 
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );
  return rows;
}

// ADICIONADO PARA TERÇA-FEIRA: PROCURA UM UTILIZADOR PELO EMAIL
// Essencial para o fluxo de login e validação de tokens JWT
export async function findUserByEmail(email) {
  const [rows] = await db.execute(
    `
      SELECT 
        id, first_name, surname, email, mobile_phone, password_hash, created_at, updated_at 
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );
  return rows;
}

// CRIA UM NOVO UTILIZADOR
export async function createUser(userData) {
  const dbData = toDbFields(userData);

  const [result] = await db.execute(
    `
      INSERT INTO users (
        first_name, surname, email, mobile_phone, password_hash
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      dbData.first_name,
      dbData.surname,
      dbData.email,
      dbData.mobile_phone ?? null, // Proteção de nulos para o campo opcional
      dbData.password_hash,
    ]
  );

  return result.insertId;
}

// ATUALIZA UM UTILIZADOR EXISTENTE
export async function updateUser(id, data) {
  const dbData = toDbFields(data);
  const fields = Object.keys(dbData);

  if (fields.length === 0) return true;

  const setClause = fields
    .map(field => `${field} = ?`)
    .join(', ');

  const values = fields.map(field => dbData[field]);
  values.push(id);

  const [result] = await db.execute(
    `
      UPDATE users
      SET ${setClause}
      WHERE id = ?
    `,
    values
  );

  return result.affectedRows > 0;
}

// APAGA UM UTILIZADOR EXISTENTE
export async function deleteUser(id) {
  const [result] = await db.execute(
    `
      DELETE FROM users
      WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
}
