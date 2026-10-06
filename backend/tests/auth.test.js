const request = require('supertest');
const app = require('../src/app');

require('./setup');

describe('Auth Endpoints (/api/auth & /api/budget)', () => {
  const testUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    monthlyBudget: 1500,
  };

  test('POST /api/auth/signup - creates a new user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.monthlyBudget).toBe(1500);
  });

  test('POST /api/auth/signup - rejects signup with duplicate email', async () => {
    await request(app).post('/api/auth/signup').send(testUser);

    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/signup - rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'incomplete@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - authenticates registered user', async () => {
    await request(app).post('/api/auth/signup').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe(testUser.name);
  });

  test('POST /api/auth/login - rejects invalid credentials', async () => {
    await request(app).post('/api/auth/signup').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - returns user profile when authenticated', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send(testUser);
    const token = signupRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('PUT /api/budget - sets user monthly budget', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send(testUser);
    const token = signupRes.body.token;

    const res = await request(app)
      .put('/api/budget')
      .set('Authorization', `Bearer ${token}`)
      .send({ monthlyBudget: 2500 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.monthlyBudget).toBe(2500);
  });
});
