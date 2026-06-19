/* Camada responsável pela comunicação com a BD.
   Base de dados → snake_case */

import { db } from '../infra/db/db.js';

// LISTA TODAS AS VIAGENS
export async function listTrips() {
  const [rows] = await db.execute(`
    SELECT id, user_id, title, description, destination, start_date, end_date, created_at, updated_at 
    FROM trips
  `);
  return rows;
}

export async function listTripsByUserId(userId) {
  const [rows] = await db.execute(`
    SELECT id, user_id, title, description, destination, start_date, end_date, created_at, updated_at
    FROM trips
    WHERE user_id = ?
    ORDER BY title ASC
  `, [userId]);

  return rows;
}


// PROCURA UMA VIAGEM PELO ID
export async function findTripById(id) {
  const [rows] = await db.execute(`
    SELECT id, user_id, title, description, destination, start_date, end_date, created_at, updated_at 
    FROM trips
    WHERE id = ?
    LIMIT 1
  `, [id]);
  
  return rows[0] ?? null;
}

// CRIA UMA NOVA VIAGEM
export async function createTrip(tripData) {
  const [result] = await db.execute(`
    INSERT INTO trips (user_id, title, description, destination, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    tripData.user_id,
    tripData.title,
    tripData.description ?? null, // Proteção de nulos para o campo opcional
    tripData.destination,
    tripData.start_date, // Passa a string YYYY-MM-DD direta para o driver MySQL salvar
    tripData.end_date
  ]);

  return result.insertId;
}

// ATUALIZA UMA VIAGEM EXISTENTE
export async function updateTrip(id, data) {
  const fields = Object.keys(data);
  if (fields.length === 0) return true;

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => data[field]);
  values.push(id);

  const [result] = await db.execute(`
    UPDATE trips
    SET ${setClause}
    WHERE id = ?
  `, values);

  return result.affectedRows > 0;
}

// APAGA UMA VIAGEM EXISTENTE
export async function deleteTrip(id) {
  const [result] = await db.execute(`
    DELETE FROM trips
    WHERE id = ?
  `, [id]);

  return result.affectedRows > 0;
}
