const base = process.env.BASE_URL || 'http://localhost:3000';
const stamp = Date.now();
const created = {};
const results = [];

async function request(method, path, token, body) {
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  return { status: response.status, json };
}

function push(name, ok, detail) {
  results.push({ name, ok, detail });
}

function expectSuccess(name, response, expectedStatus) {
  const ok = response.status === expectedStatus && response.json?.success === true;
  push(name, ok, { status: response.status, body: response.json });

  if (!ok) {
    throw new Error(`${name} failed with status ${response.status}`);
  }

  return response.json.data;
}

async function cleanup() {
  const deletions = [
    ['DELETE /api/reserves/:id', created.reserveId && `/api/reserves/${created.reserveId}`, null],
    ['DELETE /api/flights/:id', created.flightId && `/api/flights/${created.flightId}`, null],
    ['DELETE /api/accommodations/:id', created.accommodationId && `/api/accommodations/${created.accommodationId}`, null],
    ['DELETE /api/trips/:id', created.tripId && `/api/trips/${created.tripId}`, created.token],
    ['DELETE /api/users/:id', created.userId && `/api/users/${created.userId}`, created.token],
  ];

  for (const [name, path, token] of deletions) {
    if (!path) continue;

    try {
      const response = await request('DELETE', path, token);
      push(name, response.status >= 200 && response.status < 300, { status: response.status, body: response.json });
    } catch (error) {
      push(name, false, { error: error.message });
    }
  }
}

try {
  const health = await request('GET', '/health');
  push('GET /health', health.status === 200 && health.json?.success === true, { status: health.status, body: health.json });

  const authData = expectSuccess('POST /api/auth/register', await request('POST', '/api/auth/register', null, {
    first_name: 'Crud',
    surname: 'Suite',
    email: `crud-suite-${stamp}@example.com`,
    mobile_phone: '+351912345678',
    password: 'secret123',
  }), 201);
  created.userId = authData.user.id;
  created.token = authData.token;

  const users = expectSuccess('GET /api/users', await request('GET', '/api/users', created.token), 200);
  push('GET /api/users strips password_hash', Array.isArray(users) && users.every((user) => !('password_hash' in user)), { count: Array.isArray(users) ? users.length : null });

  expectSuccess('PATCH /api/users/:id', await request('PATCH', `/api/users/${created.userId}`, created.token, {
    first_name: 'CrudUpdated',
    mobile_phone: '+351911111111'
  }), 200);

  expectSuccess('PATCH /api/users/:id/password', await request('PATCH', `/api/users/${created.userId}/password`, created.token, {
    current_password: 'secret123',
    new_password: 'secret456'
  }), 200);

  const trip = expectSuccess('POST /api/trips', await request('POST', '/api/trips', created.token, {
    title: `Trip ${stamp}`,
    description: 'Integration manual CRUD check',
    destination: 'Porto',
    start_date: '2026-07-10',
    end_date: '2026-07-12'
  }), 201);
  created.tripId = trip.id;

  expectSuccess('GET /api/trips', await request('GET', '/api/trips', created.token), 200);
  expectSuccess('PATCH /api/trips/:id', await request('PATCH', `/api/trips/${created.tripId}`, created.token, {
    destination: 'Lisboa',
    description: 'Updated trip description'
  }), 200);

  const flight = expectSuccess('POST /api/flights', await request('POST', '/api/flights', null, {
    trip_id: created.tripId,
    flight_number: `TP${String(stamp).slice(-4)}`,
    airline: 'TAP',
    departure_airport: 'OPO',
    arrival_airport: 'LIS',
    departure_datetime: '2026-07-10T09:00:00.000Z',
    arrival_datetime: '2026-07-10T10:00:00.000Z'
  }), 201);
  created.flightId = flight.id;

  expectSuccess('GET /api/flights', await request('GET', '/api/flights'), 200);
  expectSuccess('PATCH /api/flights/:id', await request('PATCH', `/api/flights/${created.flightId}`, null, {
    airline: 'TAP Air Portugal'
  }), 200);

  const accommodation = expectSuccess('POST /api/accommodations', await request('POST', '/api/accommodations', null, {
    name: `Hotel ${stamp}`,
    city: 'Lisboa',
    country: 'Portugal'
  }), 201);
  created.accommodationId = accommodation.id;

  expectSuccess('GET /api/accommodations', await request('GET', '/api/accommodations'), 200);
  expectSuccess('PATCH /api/accommodations/:id', await request('PATCH', `/api/accommodations/${created.accommodationId}`, null, {
    city: 'Porto'
  }), 200);

  const reserve = expectSuccess('POST /api/reserves', await request('POST', '/api/reserves', null, {
    accommodation_id: created.accommodationId,
    trip_id: created.tripId,
    check_in_date: '2026-07-10',
    check_out_date: '2026-07-12'
  }), 201);
  created.reserveId = reserve.id;

  expectSuccess('GET /api/reserves', await request('GET', '/api/reserves'), 200);
  expectSuccess('PATCH /api/reserves/:id', await request('PATCH', `/api/reserves/${created.reserveId}`, null, {
    check_out_date: '2026-07-13'
  }), 200);
} catch (error) {
  push('fatal', false, { error: error.message, created: { ...created } });
} finally {
  await cleanup();
  const failures = results.filter((item) => !item.ok);
  process.stdout.write(JSON.stringify({ results, failures }, null, 2));
  process.exit(failures.length ? 1 : 0);
}