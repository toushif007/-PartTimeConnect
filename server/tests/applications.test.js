const request = require('supertest');
const app = require('../server');
const { connectTestDB, clearTestDB, closeTestDB } = require('./testSetup');
const Category = require('../models/Category');
const StudentProfile = require('../models/StudentProfile');

let studentToken, studentUser;
let employerToken, employerUser;
let categoryId;
let jobId;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // 1. Create Category
  const cat = await Category.create({ name: 'Web Engineering', slug: 'web-eng' });
  categoryId = cat._id;

  // 2. Create Employer
  const empRes = await request(app).post('/api/auth/register').send({
    name: 'Tech Founder',
    email: 'founder@startup.example.com',
    password: 'Password123!',
    role: 'employer',
    companyName: 'Startup Inc',
  });
  employerToken = empRes.body.data.token;
  employerUser = empRes.body.data.user;

  // 3. Create Student
  const stuRes = await request(app).post('/api/auth/register').send({
    name: 'Dev Student',
    email: 'dev.student@example.com',
    password: 'Password123!',
    role: 'student',
  });
  studentToken = stuRes.body.data.token;
  studentUser = stuRes.body.data.user;

  // Set student resume in profile so application passes validation
  await StudentProfile.findOneAndUpdate(
    { user: studentUser.id },
    {
      resume: {
        filename: 'resume.pdf',
        originalName: 'Dev_Student_Resume.pdf',
        path: require('path').join(__dirname, '../uploads/resumes/demo-resume.pdf'),
        mimeType: 'application/pdf',
      },
    }
  );

  // 4. Create Job
  const jobRes = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${employerToken}`)
    .send({
      title: 'Junior React Specialist',
      description: 'Building student dashboards.',
      category: categoryId,
      stipend: { amount: 15000 },
      workMode: 'remote',
    });
  jobId = jobRes.body.data._id;
});

afterAll(async () => {
  await closeTestDB();
});

describe('3. Application & Saved Jobs Suite', () => {
  // Test 11: Student job application
  test('Test 11: Student can successfully apply for an active job', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        jobId,
        coverNote: 'I am excited to apply for this React role.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('applied');
    expect(res.body.data.coverNote).toContain('React role');
  });

  // Test 12: Duplicate application prevention
  test('Test 12: Duplicate job application is prevented and returns 400 error', async () => {
    // First application
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId, coverNote: 'First application' });

    // Second application (duplicate attempt)
    const duplicateRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId, coverNote: 'Second attempt' });

    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.message).toMatch(/already applied/i);
  });

  // Test 13: Save and unsave jobs
  test('Test 13: Student can save a job to bookmarks and remove it (unsave)', async () => {
    // Save job
    const saveRes = await request(app)
      .post(`/api/saved-jobs/${jobId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(saveRes.status).toBe(201);
    expect(saveRes.body.success).toBe(true);

    // Verify saved list
    const listRes = await request(app)
      .get('/api/saved-jobs')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);

    // Unsave job
    const unsaveRes = await request(app)
      .delete(`/api/saved-jobs/${jobId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(unsaveRes.status).toBe(200);

    // Verify list is empty
    const listAfterRes = await request(app)
      .get('/api/saved-jobs')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(listAfterRes.body.data.length).toBe(0);
  });

  // Test 14: Employer applicant management
  test('Test 14: Employer can view applicants for their posted job', async () => {
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId, coverNote: 'Please review my resume.' });

    const applicantsRes = await request(app)
      .get(`/api/employers/jobs/${jobId}/applicants`)
      .set('Authorization', `Bearer ${employerToken}`);

    expect(applicantsRes.status).toBe(200);
    expect(applicantsRes.body.success).toBe(true);
    expect(applicantsRes.body.data.length).toBe(1);
    expect(applicantsRes.body.data[0].student.email).toBe('dev.student@example.com');
  });

  // Test 15: Application status updates
  test('Test 15: Employer can shortlist an applicant and update status', async () => {
    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId, coverNote: 'Looking forward to working together.' });

    const applicationId = appRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        status: 'shortlisted',
        note: 'Candidate has strong skills. Shortlisted.',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.status).toBe('shortlisted');
  });
});
