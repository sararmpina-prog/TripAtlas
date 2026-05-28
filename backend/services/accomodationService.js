import { db } from '../infra/db/db.js';

export async function listAccomodations() {
  const [rows] = await db.query('SELECT * FROM accomodations');
  return rows;
}