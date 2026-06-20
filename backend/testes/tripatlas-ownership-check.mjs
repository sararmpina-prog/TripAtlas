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

async function registerUser(label, counter) {
  const response = await request('POST', '/api/auth/register', null, {
    first_name: label,
    surname: 'Owner',
    email: `${label.toLowerCase()}-${stamp}@example.com`,
    mobile_phone: `+35190${String(stamp).slice(-5)}${counter}`,
    password: 'Secret123!',
  });

  if (response.status !== 201 || response.json?.success !== true) {
    throw new Error(`register ${label} failed`);
  }

  return response.json.data;
}

try {
  const userA = await registerUser('Alpha', '1');
  const userB = await registerUser('Beta', '2');
  created.userAId = userA.user.id;
  created.userBId = userB.user.id;
  created.tokenA = userA.token;
  created.tokenB = userB.token;

  const tripA = await request('POST', '/api/trips', created.tokenA, {
    user_id: created.userAId,
    title: `Trip A ${stamp}`,
    destination: 'Porto',
    start_date: '2026-07-10',
    end_date: '2026-07-12'
  });
  push('POST /api/trips uses authenticated user', tripA.status === 201 && tripA.json?.data?.user_id === created.userAId, { status: tripA.status, body: tripA.json });
  created.tripAId = tripA.json?.data?.id;

  const tripB = await request('POST', '/api/trips', created.tokenB, {
    user_id: created.userBId,
    title: `Trip B ${stamp}`,
    destination: 'Lisboa',
    start_date: '2026-08-10',
    end_date: '2026-08-12'
  });
  push('POST /api/trips for second user', tripB.status === 201 && tripB.json?.data?.user_id === created.userBId, { status: tripB.status, body: tripB.json });
  created.tripBId = tripB.json?.data?.id;

  const usersA = await request('GET', '/api/users', created.tokenA);
  push('GET /api/users returns only self', usersA.status === 200 && Array.isArray(usersA.json?.data) && usersA.json.data.length === 1 && usersA.json.data[0].id === created.userAId, { status: usersA.status, body: usersA.json });

  const tripsA = await request('GET', '/api/trips', created.tokenA);
  push('GET /api/trips returns only own trips', tripsA.status === 200 && Array.isArray(tripsA.json?.data) && tripsA.json.data.length === 1 && tripsA.json.data[0].id === created.tripAId, { status: tripsA.status, body: tripsA.json });

  const patchOtherUser = await request('PATCH', `/api/users/${created.userBId}`, created.tokenA, { first_name: 'Hack' });
  push('PATCH /api/users/:id blocks other user', patchOtherUser.status === 403, { status: patchOtherUser.status, body: patchOtherUser.json });

  const patchOtherTrip = await request('PATCH', `/api/trips/${created.tripBId}`, created.tokenA, { title: 'Hack trip' });
  push('PATCH /api/trips/:id blocks other trip', patchOtherTrip.status === 403, { status: patchOtherTrip.status, body: patchOtherTrip.json });

  const accommodation = await request('POST', '/api/accommodations', null, {
    name: `Ownership Hotel ${stamp}`,
    address: 'Ownership Street 77',
    city: 'Coimbra',
    country: 'Portugal',
  });
  push('POST /api/accommodations creates shared accommodation', accommodation.status === 201, { status: accommodation.status, body: accommodation.json });
  created.accommodationId = accommodation.json?.data?.id;

  const flightA = await request('POST', '/api/flights', created.tokenA, {
    trip_id: created.tripAId,
    flight_number: `OA${String(stamp).slice(-4)}`,
    airline: 'TAP',
    departure_airport: 'OPO',
    arrival_airport: 'LIS',
    departure_datetime: '2026-07-10T09:00:00.000Z',
    arrival_datetime: '2026-07-10T10:00:00.000Z',
    direction: 'outbound' 
  });
  push('POST /api/flights creates flight on own trip', flightA.status === 201, { status: flightA.status, body: flightA.json });
  created.flightAId = flightA.json?.data?.id;

  const flightsA = await request('GET', '/api/flights', created.tokenA);
  push('GET /api/flights returns only own trip flights', flightsA.status === 200 && Array.isArray(flightsA.json?.data) && flightsA.json.data.every((flight) => flight.trip_id === created.tripAId), { status: flightsA.status, body: flightsA.json });

  const patchOtherFlight = await request('PATCH', `/api/flights/${created.flightAId}`, created.tokenB, { airline: 'Hack Air' });
  push('PATCH /api/flights/:id blocks other user flight', patchOtherFlight.status === 403, { status: patchOtherFlight.status, body: patchOtherFlight.json });

  const deleteOtherFlight = await request('DELETE', `/api/flights/${created.flightAId}`, created.tokenB);
  push('DELETE /api/flights/:id blocks other user flight', deleteOtherFlight.status === 403, { status: deleteOtherFlight.status, body: deleteOtherFlight.json });

  const reserveA = await request('POST', '/api/reserves', created.tokenA, {
    accommodation_id: created.accommodationId,
    trip_id: created.tripAId,
    check_in_date: '2026-07-10',
    check_out_date: '2026-07-12'
  });
  push('POST /api/reserves creates reserve on own trip', reserveA.status === 201, { status: reserveA.status, body: reserveA.json });
  created.reserveAId = reserveA.json?.data?.id;

  const reservesA = await request('GET', '/api/reserves', created.tokenA);
  push('GET /api/reserves returns only own trip reserves', reservesA.status === 200 && Array.isArray(reservesA.json?.data) && reservesA.json.data.every((reserve) => reserve.trip_id === created.tripAId), { status: reservesA.status, body: reservesA.json });

  const patchOtherReserve = await request('PATCH', `/api/reserves/${created.reserveAId}`, created.tokenB, { check_out_date: '2026-07-13' });
  push('PATCH /api/reserves/:id blocks other user reserve', patchOtherReserve.status === 403, { status: patchOtherReserve.status, body: patchOtherReserve.json });

  const deleteOtherReserve = await request('DELETE', `/api/reserves/${created.reserveAId}`, created.tokenB);
  push('DELETE /api/reserves/:id blocks other user reserve', deleteOtherReserve.status === 403, { status: deleteOtherReserve.status, body: deleteOtherReserve.json });

  const anonymousTrips = await request('GET', '/api/trips', null);
  push('GET /api/trips requires token', anonymousTrips.status === 401, { status: anonymousTrips.status, body: anonymousTrips.json });
} catch (error) {
  push('fatal', false, { error: error.message, created });
} finally {

  if (created.reserveAId) await request('DELETE', `/api/reserves/${created.reserveAId}`, created.tokenA);
  if (created.flightAId) await request('DELETE', `/api/flights/${created.flightAId}`, created.tokenA);
  if (created.accommodationId) await request('DELETE', `/api/accommodations/${created.accommodationId}`, null);
  if (created.tripAId) await request('DELETE', `/api/trips/${created.tripAId}`, created.tokenA);
  if (created.tripBId) await request('DELETE', `/api/trips/${created.tripBId}`, created.tokenB);
  if (created.userAId) await request('DELETE', `/api/users/${created.userAId}`, created.tokenA);
  if (created.userBId) await request('DELETE', `/api/users/${created.userBId}`, created.tokenB);

  const failures = results.filter((item) => !item.ok);
  process.stdout.write(JSON.stringify({ results, failures }, null, 2));
  process.exit(failures.length ? 1 : 0);
}
