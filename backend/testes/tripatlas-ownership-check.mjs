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

async function registerUser(label) {
  const response = await request('POST', '/api/auth/register', null, {
    first_name: label,
    surname: 'Owner',
    email: `${label.toLowerCase()}-${stamp}@example.com`,
    mobile_phone: '+351900000000',
    password: 'secret123',
  });

  if (response.status !== 201 || response.json?.success !== true) {
    throw new Error(`register ${label} failed`);
  }

  return response.json.data;
}

try {
  const userA = await registerUser('Alpha');
  const userB = await registerUser('Beta');
  created.userAId = userA.user.id;
  created.userBId = userB.user.id;
  created.tokenA = userA.token;
  created.tokenB = userB.token;

  const tripA = await request('POST', '/api/trips', created.tokenA, {
    user_id: 999,
    title: `Trip A ${stamp}`,
    destination: 'Porto',
    start_date: '2026-07-10',
    end_date: '2026-07-12'
  });
  push('POST /api/trips uses authenticated user', tripA.status === 201 && tripA.json?.data?.user_id === created.userAId, { status: tripA.status, body: tripA.json });
  created.tripAId = tripA.json?.data?.id;

  const tripB = await request('POST', '/api/trips', created.tokenB, {
    user_id: 999,
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

  const anonymousTrips = await request('GET', '/api/trips', null);
  push('GET /api/trips requires token', anonymousTrips.status === 401, { status: anonymousTrips.status, body: anonymousTrips.json });
} catch (error) {
  push('fatal', false, { error: error.message, created });
} finally {
  if (created.tripAId) await request('DELETE', `/api/trips/${created.tripAId}`, created.tokenA);
  if (created.tripBId) await request('DELETE', `/api/trips/${created.tripBId}`, created.tokenB);
  if (created.userAId) await request('DELETE', `/api/users/${created.userAId}`, created.tokenA);
  if (created.userBId) await request('DELETE', `/api/users/${created.userBId}`, created.tokenB);

  const failures = results.filter((item) => !item.ok);
  process.stdout.write(JSON.stringify({ results, failures }, null, 2));
  process.exit(failures.length ? 1 : 0);
}
