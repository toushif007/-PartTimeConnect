const request = require('supertest');
const app = require('../server');
const { connectTestDB, clearTestDB, closeTestDB } = require('./testSetup');
const Category = require('../models/Category');

let employerToken;
let categoryId;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create category
  const cat = await Category.create({
    name: 'Software Development',
    slug: 'software-dev',
    icon: 'Code',
  });
  categoryId = cat._id;

  // Create employer
  const empRes = await request(app).post('/api/auth/register').send({
    name: 'Acme Recruiter',
    email: 'acme.recruiter@example.com',
    password: 'Password123!',
    role: 'employer',
    companyName: 'Acme Corp',
  });
  employerToken = empRes.body.data.token;
});

afterAll(async () => {
  await closeTestDB();
});

describe('2. Job Management, Search, Filters & Pagination Suite', () => {
  // Test 7: Job creation
  test('Test 7: Employer can successfully create a new part-time job', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'React.js Frontend Intern',
        description: 'Assist in building responsive React components for client apps.',
        category: categoryId,
        jobType: 'internship',
        workMode: 'remote',
        location: 'Remote, India',
        requiredSkills: ['React', 'JavaScript', 'CSS'],
        stipend: { amount: 12000, frequency: 'monthly' },
        vacancies: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('React.js Frontend Intern');
    expect(res.body.data.workMode).toBe('remote');
    expect(res.body.data.stipend.amount).toBe(12000);
  });

  // Test 8: Job search
  test('Test 8: MongoDB keyword search finds matching job titles and descriptions', async () => {
    // Seed 2 jobs
    await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'Python Flask Backend Developer',
        description: 'Build backend APIs with Python.',
        category: categoryId,
        stipend: { amount: 10000 },
        requiredSkills: ['Python', 'Flask'],
      });

    await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'Flutter Mobile App Intern',
        description: 'Build cross platform mobile apps.',
        category: categoryId,
        stipend: { amount: 15000 },
        requiredSkills: ['Flutter', 'Dart'],
      });

    const searchRes = await request(app).get('/api/jobs?keyword=Python');

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.success).toBe(true);
    expect(searchRes.body.data.length).toBe(1);
    expect(searchRes.body.data[0].title).toContain('Python');
  });

  // Test 9: Job filtering
  test('Test 9: Filters by workMode, category, and stipend range work accurately', async () => {
    await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'Remote Designer',
        description: 'Work from home.',
        category: categoryId,
        workMode: 'remote',
        stipend: { amount: 8000 },
      });

    await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'On-Site Office Assistant',
        description: 'Work at Bengaluru office.',
        category: categoryId,
        workMode: 'on-site',
        location: 'Bengaluru',
        stipend: { amount: 20000 },
      });

    // Filter by workMode=remote
    const remoteRes = await request(app).get('/api/jobs?workMode=remote');
    expect(remoteRes.status).toBe(200);
    expect(remoteRes.body.data.length).toBe(1);
    expect(remoteRes.body.data[0].workMode).toBe('remote');

    // Filter by minStipend=15000
    const stipendRes = await request(app).get('/api/jobs?minStipend=15000');
    expect(stipendRes.status).toBe(200);
    expect(stipendRes.body.data.length).toBe(1);
    expect(stipendRes.body.data[0].stipend.amount).toBe(20000);
  });

  // Test 10: Job pagination
  test('Test 10: Pagination correctly limits results and calculates total pages', async () => {
    // Create 5 jobs
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: `Job Listing Number ${i}`,
          description: `Description for listing ${i}`,
          category: categoryId,
          stipend: { amount: 5000 + i * 1000 },
        });
    }

    const pageRes = await request(app).get('/api/jobs?page=1&limit=2');

    expect(pageRes.status).toBe(200);
    expect(pageRes.body.success).toBe(true);
    expect(pageRes.body.data.length).toBe(2);
    expect(pageRes.body.meta.total).toBe(5);
    expect(pageRes.body.meta.totalPages).toBe(3);
    expect(pageRes.body.meta.hasNextPage).toBe(true);
  });
});
