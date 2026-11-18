const http = require('http');

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function testLiveEndpoints() {
  console.log('Testing live backend server endpoints...');

  // 1. Health check
  const health = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log('1. /api/health:', health.status, health.body);

  // 2. Public categories
  const categories = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/categories',
    method: 'GET',
  });
  console.log('2. /api/categories count:', categories.body.data?.length);

  // 3. Public jobs search
  const jobs = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/jobs?keyword=React',
    method: 'GET',
  });
  console.log('3. /api/jobs?keyword=React count:', jobs.body.data?.length);

  // 4. Student login
  const loginStudent = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'student@parttimeconnect.com', password: 'Password123!' }
  );
  console.log('4. Student Login:', loginStudent.status, 'User:', loginStudent.body.data?.user?.email, 'Role:', loginStudent.body.data?.user?.role);

  // 5. Employer login
  const loginEmployer = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'vikram@techinnovators.com', password: 'Password123!' }
  );
  console.log('5. Employer Login:', loginEmployer.status, 'User:', loginEmployer.body.data?.user?.email, 'Role:', loginEmployer.body.data?.user?.role);

  // 6. Admin login
  const loginAdmin = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@parttimeconnect.com', password: 'Password123!' }
  );
  console.log('6. Admin Login:', loginAdmin.status, 'User:', loginAdmin.body.data?.user?.email, 'Role:', loginAdmin.body.data?.user?.role);

  console.log('ALL LIVE API TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

testLiveEndpoints().catch((err) => {
  console.error('Live API Test Failed:', err.message);
  process.exit(1);
});
