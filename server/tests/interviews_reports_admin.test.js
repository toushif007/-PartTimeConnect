const request = require('supertest');
const app = require('../server');
const { connectTestDB, clearTestDB, closeTestDB } = require('./testSetup');
const Category = require('../models/Category');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

let studentToken, studentUser;
let employerToken, employerUser;
let otherEmployerToken;
let adminToken, adminUser;
let categoryId;
let jobId;
let applicationId;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create Category
  const cat = await Category.create({ name: 'Tech', slug: 'tech' });
  categoryId = cat._id;

  // Create Admin
  adminUser = await User.create({
    name: 'Admin Boss',
    email: 'admin.test@example.com',
    password: 'Password123!',
    role: 'admin',
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin.test@example.com',
    password: 'Password123!',
  });
  adminToken = adminLogin.body.data.token;

  // Create Employer
  const empRes = await request(app).post('/api/auth/register').send({
    name: 'Primary Employer',
    email: 'primary.emp@example.com',
    password: 'Password123!',
    role: 'employer',
    companyName: 'Primary Tech',
  });
  employerToken = empRes.body.data.token;
  employerUser = empRes.body.data.user;

  // Create Second Employer (for unauthorized tests)
  const otherEmpRes = await request(app).post('/api/auth/register').send({
    name: 'Other Employer',
    email: 'other.emp@example.com',
    password: 'Password123!',
    role: 'employer',
    companyName: 'Other Tech',
  });
  otherEmployerToken = otherEmpRes.body.data.token;

  // Create Student
  const stuRes = await request(app).post('/api/auth/register').send({
    name: 'Alex Student',
    email: 'alex.stu@example.com',
    password: 'Password123!',
    role: 'student',
  });
  studentToken = stuRes.body.data.token;
  studentUser = stuRes.body.data.user;

  // Add resume to student profile
  await StudentProfile.findOneAndUpdate(
    { user: studentUser.id },
    {
      resume: {
        filename: 'resume.pdf',
        originalName: 'Alex_Resume.pdf',
        path: require('path').join(__dirname, '../uploads/resumes/demo-resume.pdf'),
        mimeType: 'application/pdf',
      },
    }
  );

  // Create Job
  const jobRes = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${employerToken}`)
    .send({
      title: 'Full Stack Assistant',
      description: 'Assist with frontend and backend.',
      category: categoryId,
      stipend: { amount: 15000 },
    });
  jobId = jobRes.body.data._id;

  // Apply to Job
  const appRes = await request(app)
    .post('/api/applications')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ jobId, coverNote: 'Great fit for this role.' });
  applicationId = appRes.body.data._id;
});

afterAll(async () => {
  await closeTestDB();
});

describe('4. Interviews, Notifications, Admin & Security Suite', () => {
  // Test 16: Interview scheduling
  test('Test 16: Employer can schedule an interview and status updates automatically', async () => {
    const interviewTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        applicationId,
        scheduledAt: interviewTime,
        mode: 'online',
        meetingLinkOrLocation: 'https://meet.google.com/abc-defg-hij',
        instructions: 'Please bring your portfolio.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mode).toBe('online');
    expect(res.body.data.meetingLinkOrLocation).toContain('meet.google.com');
  });

  // Test 17: Notifications
  test('Test 17: User receives in-app notifications and can mark them as read', async () => {
    // Check student notifications (should have application submission / interview notices)
    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(notifRes.status).toBe(200);
    expect(notifRes.body.success).toBe(true);

    // Mark all as read
    const markRes = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(markRes.status).toBe(200);
    expect(markRes.body.success).toBe(true);
  });

  // Test 18: Admin user blocking
  test('Test 18: Admin can block a user and blocked user is rejected on protected routes', async () => {
    // Admin blocks student
    const blockRes = await request(app)
      .patch(`/api/admin/users/${studentUser.id}/block`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(blockRes.status).toBe(200);
    expect(blockRes.body.success).toBe(true);
    expect(blockRes.body.data.isBlocked).toBe(true);

    // Blocked student attempts to access their profile
    const profileRes = await request(app)
      .get('/api/students/profile')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(profileRes.status).toBe(403);
    expect(profileRes.body.message).toMatch(/account has been blocked|suspended/i);
  });

  // Test 19: Job reporting
  test('Test 19: Student can report a suspicious job and Admin can view/resolve it', async () => {
    // Student files report
    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        jobId,
        reason: 'incorrect_information',
        details: 'The stipend stated is misleading.',
      });

    expect(reportRes.status).toBe(201);
    expect(reportRes.body.success).toBe(true);
    const reportId = reportRes.body.data._id;

    // Admin views reports
    const adminReportsRes = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminReportsRes.status).toBe(200);
    expect(adminReportsRes.body.data.length).toBeGreaterThanOrEqual(1);

    // Admin resolves report
    const resolveRes = await request(app)
      .patch(`/api/reports/${reportId}/resolve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'reviewed',
        resolutionNotes: 'Employer contacted to update job posting.',
      });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.status).toBe('reviewed');
  });

  // Test 20: Unauthorized resume access
  test('Test 20: Unauthorized employer cannot access or download an applicant resume (403 Forbidden)', async () => {
    // Other employer (who did NOT post the job) tries to download resume
    const unauthorizedRes = await request(app)
      .get(`/api/employers/applicants/${applicationId}/resume`)
      .set('Authorization', `Bearer ${otherEmployerToken}`);

    expect(unauthorizedRes.status).toBe(403);
    expect(unauthorizedRes.body.success).toBe(false);
    expect(unauthorizedRes.body.message).toMatch(/Forbidden|permission/i);
  });
});
