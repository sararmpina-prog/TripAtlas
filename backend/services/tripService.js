import { db } from '../infra/db/db.js';
import { NotFoundError } from '../utils/appErrors.js';
// import { validateCreateTrip, validateTripId, validateUpdateTrip } from '../validators/tripValidator.js';

function normalizeTrip(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listTrips() {
  const [rows] = await db.execute('SELECT * FROM trips ORDER BY start_date ASC, id DESC');
  return rows.map(normalizeTrip);
}

export async function createTrip(payload = {}) {
  const trip = validateCreateTrip(payload);

  const [result] = await db.execute(
    `
      INSERT INTO trips (user_id, title, description, destination, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [trip.userId, trip.title, trip.description, trip.destination, trip.startDate, trip.endDate]
  );

  const [rows] = await db.execute('SELECT * FROM trips WHERE id = ? LIMIT 1', [result.insertId]);
  return normalizeTrip(rows[0]);
}

export async function updateTrip(id, payload = {}) {
  const tripId = validateTripId(id);
  const trip = validateUpdateTrip(payload);
  const updates = [];
  const values = [];

  if (Object.hasOwn(trip, 'userId')) {
    updates.push('user_id = ?');
    values.push(trip.userId);
  }

  if (Object.hasOwn(trip, 'title')) {
    updates.push('title = ?');
    values.push(trip.title);
  }

  if (Object.hasOwn(trip, 'description')) {
    updates.push('description = ?');
    values.push(trip.description);
  }

  if (Object.hasOwn(trip, 'destination')) {
    updates.push('destination = ?');
    values.push(trip.destination);
  }

  if (Object.hasOwn(trip, 'startDate')) {
    updates.push('start_date = ?');
    values.push(trip.startDate);
  }

  if (Object.hasOwn(trip, 'endDate')) {
    updates.push('end_date = ?');
    values.push(trip.endDate);
  }

  values.push(tripId);

  const [result] = await db.execute(`UPDATE trips SET ${updates.join(', ')} WHERE id = ?`, values);

  if (result.affectedRows === 0) {
    throw new NotFoundError('Trip não encontrada para atualizar.');
  }

  const [rows] = await db.execute('SELECT * FROM trips WHERE id = ? LIMIT 1', [tripId]);
  return normalizeTrip(rows[0]);
}

export async function deleteTrip(id) {
  const tripId = validateTripId(id);
  const [rows] = await db.execute('SELECT * FROM trips WHERE id = ? LIMIT 1', [tripId]);

  if (!rows[0]) {
    throw new NotFoundError('Trip não encontrada para apagar.');
  }

  await db.execute('DELETE FROM trips WHERE id = ?', [tripId]);
  return normalizeTrip(rows[0]);
}