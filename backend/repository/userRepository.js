/* Camada responsável pela comunicação com a BD.
   Base de dados → snake_case */

import { db } from '../infra/db/db.js';

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
  return rows[0] ?? null;
}

// PROCURA UM UTILIZADOR PELO EMAIL
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
  return rows[0] ?? null;
}

// CRIA UM NOVO UTILIZADOR
export async function createUser(userData) {
  // Como userData já está em snake_case vindo do Zod/Service, fazemos o insert direto!
  const [result] = await db.execute(`
    INSERT INTO users (first_name, surname, email, mobile_phone, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `, [
    userData.first_name,
    userData.surname,
    userData.email,
    userData.mobile_phone ?? null, // Proteção de nulos para o campo opcional
    userData.password // Lido do campo 'password' enviado pelo JSON
  ]);

  return result.insertId;
}

// ATUALIZA UM UTILIZADOR EXISTENTE
export async function updateUser(id, data) {
  const fields = Object.keys(data);
  if (fields.length === 0) return true;

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => data[field]);
  values.push(id);

  const [result] = await db.execute(`
    UPDATE users
    SET ${setClause}
    WHERE id = ?
  `, values);

  return result.affectedRows > 0;
}

// ATUALIZA APENAS A PASSWORD DE UM UTILIZADOR EXISTENTE
export async function updateUserPasswordHash(userId, passwordHash) {
  const query = `
    UPDATE users 
    SET password_hash = ? 
    WHERE id = ?
  `;
  
  const [result] = await db.execute(query, [passwordHash, userId]);
  return result.affectedRows > 0;
}

// APAGA UM UTILIZADOR EXISTENTE
export async function deleteUser(id) {
  const [result] = await db.execute(`
    DELETE FROM users
    WHERE id = ?
  `, [id]);

  return result.affectedRows > 0;
}
