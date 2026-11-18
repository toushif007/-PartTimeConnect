const request = require('supertest');
const app = require('../server');
const { connectTestDB, clearTestDB, closeTestDB } = require('./testSetup');
const User = require('../models/User');

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('1. Authentication & Authorization Test Suite', () => {
  // Test 1: Student registration
  test('Test 1: Student registration succeeds and returns JWT token and student profile', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Student',
      email: 'john.student@example.com',
      password: 'Password123!',
      role: 'student',
      college: 'Apex University',
      course: 'MCA',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.user.email).toBe('john.student@example.com');
  });

  // Test 2: Employer registration
  test('Test 2: Employer registration succeeds with company name and returns JWT token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sarah Employer',
      email: 'sarah@techcorp.example.com',
      password: 'Password123!',
      role: 'employer',
      companyName: 'TechCorp Solutions',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('employer');
  });

  // Test 3: Login
  test('Test 3: Valid credentials log in successfully and return JWT token', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'login.test@example.com',
      password: 'Password123!',
      role: 'student',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login.test@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('login.test@example.com');
  });

  // Test 4: Incorrect password
  test('Test 4: Login with incorrect password returns 401 Unauthorized', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'wrongpass@example.com',
      password: 'Password123!',
      role: 'student',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'wrongpass@example.com',
      password: 'WrongPassword999',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid email or password/i);
  });

  // Test 5: Protected routes
  test('Test 5: Accessing protected route without JWT token returns 401 Access Denied', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Access denied/i);
  });

  // Test 6: Role authorization
  test('Test 6: Student role cannot access employer-only routes (returns 403 Forbidden)', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Student User',
      email: 'student.role@example.com',
      password: 'Password123!',
      role: 'student',
    });
    const token = regRes.body.data.token;

    // Attempt to access employer jobs endpoint
    const res = await request(app)
      .get('/api/employers/jobs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  // Security test: Admin registration disallowed via public endpoint
  test('Security Rule: Cannot register as admin via public registration route', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Fake Admin',
      email: 'fakeadmin@example.com',
      password: 'Password123!',
      role: 'admin',
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Admin registration is not permitted/i);
  });
});
