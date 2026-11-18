# PartTimeConnect – Student Part-Time Job Portal

**PartTimeConnect** is a full-stack web application designed for the **Master of Computer Applications (MCA) Mini Project**. It provides a secure, role-based platform connecting college students with employers offering flexible, skill-aligned part-time job opportunities, internships, and freelance projects.

Built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) and bundled with **Vite**, the platform provides a complete end-to-end recruitment experience featuring automated rule-based job recommendations, resume management, interview scheduling, notification alerts, and administrative moderation.

---

## 📑 Table of Contents
1. [Key Features by Role](#-key-features-by-role)
2. [Technology Stack](#-technology-stack)
3. [System Architecture](#-system-architecture)
4. [Project Directory Structure](#-project-directory-structure)
5. [Prerequisites & Development Environment](#-prerequisites--development-environment)
6. [Installation & Setup Guide](#-installation--setup-guide)
7. [Database Seeding & Demo Credentials](#-database-seeding--demo-credentials)
8. [Automated Testing with Jest & Supertest](#-automated-testing-with-jest--supertest)
9. [REST API Endpoints Reference](#-rest-api-endpoints-reference)
10. [Skill Recommendation Engine](#-skill-recommendation-engine)
11. [Security & Role-Based Authorization](#-security--role-based-authorization)

---

## 🎯 Key Features by Role

### 👨‍🎓 Student Role
- **Authentication & Profile:** Registration, secure JWT login, profile management with college, course, graduation year, contact details, bio, and skill tags.
- **Resume Management:** Upload, preview, download, and delete resumes (PDF/DOC/DOCX up to 5 MB) stored securely on the server.
- **Job Discovery & Search:** Real-time keyword search, filtering by category, work mode (Remote, On-site, Hybrid), job type (Part-time, Internship, Freelance), stipend range, and multi-criteria sorting.
- **Smart Recommendations:** Rule-based matching engine calculating match percentages, highlighted matching skills, and missing skills to guide student upskilling.
- **Application Tracking:** 1-click applications with cover notes, duplicate application prevention, application timeline tracking (`pending`, `reviewed`, `shortlisted`, `rejected`, `hired`), and self-service application withdrawal.
- **Saved Jobs:** Bookmark opportunities to review and apply later.
- **Interview & Alert Notifications:** Real-time in-app notification center for interview calls, status changes, and platform announcements.
- **Safety Reporting:** Report suspicious or scam job listings directly to system administrators.

### 🏢 Employer Role
- **Company Branding:** Manage company profile including industry, company size, website, office location, and bio.
- **Job Lifecycle Management:** Create, edit, pause/activate, and delete part-time listings.
- **Candidate Management:** Dedicated applicant review dashboard displaying candidate educational backgrounds, matching skill badges, cover letters, and application timestamps.
- **Secure Resume Access:** Controlled file retrieval ensuring employers can only download resumes belonging to their own job applicants.
- **Hiring Workflow:** Update application status (`reviewed`, `shortlisted`, `rejected`, `hired`) with automatic notifications triggered to applicants.
- **Interview Scheduling:** Built-in interview scheduler specifying date, time, interview mode (Google Meet, Zoom, Phone, In-person), meeting link/location, and candidate instructions.

### 🛡️ Admin Role
- **Executive Dashboard:** Live metrics displaying total students, total employers, active job listings, submitted applications, and scheduled interviews.
- **User Governance:** Search and filter all registered users, inspect roles and creation dates, and instantly block/unblock accounts to enforce terms of service.
- **Listing Moderation:** Oversee all jobs posted across the platform with immediate unpublish and delete capabilities.
- **Category Management:** Dynamically create, rename, and delete job categories (e.g., Web Development, UI/UX Design, Content Writing).
- **Incident & Report Review:** Moderation queue reviewing student-flagged suspicious listings with 1-click dismissal or job removal.

---

## 💻 Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, JavaScript (ES6+), React Router DOM v6, Axios, Lucide React Icons |
| **Styling** | Vanilla Modular CSS with CSS Variables, Responsive Grid & Flexbox Design System |
| **Backend** | Node.js, Express.js (RESTful API architecture) |
| **Database** | MongoDB Community Server (Local), Mongoose ODM v8 |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing (10 salt rounds) |
| **File Storage** | Multer private disk storage with sanitized filenames and MIME validation |
| **Automated Testing** | Jest, Supertest, MongoMemoryServer for isolated unit/integration tests |

---

## 🏛️ System Architecture

PartTimeConnect adheres to a 3-tier client-server architectural pattern:

```
[ React 18 Client (Vite) ]  <--- HTTP/JSON via Axios --->  [ Express.js REST API ]  <--->  [ MongoDB 9.x ]
     port: 5173                                                 port: 5000                   port: 27017
   - Context API State                                       - JWT Auth & RBAC
   - React Router DOM                                        - Multer Resume Storage
   - Lucide Icons                                            - Recommendation Engine
```

---

## 📁 Project Directory Structure

```
PartTimeConnect/
├── client/                       # React.js Vite Frontend
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── components/           # Reusable UI components (Navbar, Footer, Sidebar, ProtectedRoute)
│   │   ├── context/              # AuthContext & NotificationContext
│   │   ├── pages/
│   │   │   ├── admin/            # Admin dashboard, user/job/category/report moderation
│   │   │   ├── employer/         # Employer dashboard, job posting, applicant & interview management
│   │   │   ├── student/          # Student dashboard, profile, applications, saved jobs, recommendations
│   │   │   ├── About.jsx         # Public About Us page
│   │   │   ├── Contact.jsx       # Public Contact page
│   │   │   ├── Home.jsx          # Landing page with hero, statistics, and featured jobs
│   │   │   ├── JobDetails.jsx    # Public/Auth job details, application modal, report modal
│   │   │   ├── Jobs.jsx          # Public job directory with search, filter, and sorting
│   │   │   ├── Login.jsx         # Login screen with 1-click Demo credentials switcher
│   │   │   └── Register.jsx      # Role-based registration screen
│   │   ├── services/             # Axios API client with JWT request/response interceptors
│   │   ├── styles/               # Design system, CSS variables, components, and layout styling
│   │   ├── App.jsx               # Application routes and provider tree
│   │   └── main.jsx              # React DOM entry point
│   ├── package.json
│   └── vite.config.js            # Vite configuration with /api reverse proxy
│
├── server/                       # Express.js & MongoDB Backend
│   ├── config/                   # MongoDB connection logic (config/db.js)
│   ├── controllers/              # Business logic controllers (Auth, Jobs, Applications, Admin, etc.)
│   ├── middleware/               # authMiddleware, roleMiddleware, uploadMiddleware, errorMiddleware
│   ├── models/                   # 10 Mongoose Schemas (User, StudentProfile, Job, Application, etc.)
│   ├── routes/                   # RESTful API route definitions
│   ├── scripts/
│   │   ├── seed.js               # Comprehensive database seeder with realistic test data
│   │   └── verifyLiveApi.js      # Health and live endpoint verification runner
│   ├── services/                 # Recommendation engine & search query builder
│   ├── tests/                    # 4 Jest + Supertest suites (21 test cases)
│   ├── uploads/resumes/          # Private local storage for student resumes
│   ├── .env                      # Environment configuration
│   ├── package.json
│   └── server.js                 # Express server bootstrap
│
├── ARCHITECTURE.md               # Detailed architectural specification & database schemas
└── README.md                     # Comprehensive project documentation
```

---

## ⚙️ Prerequisites & Development Environment

- **Operating System:** Windows 10/11, macOS, or Linux
- **Node.js:** v18.x or v20.x LTS installed
- **MongoDB:** MongoDB Community Server (v7.x, v8.x, or v9.x) running locally on port `27017`
  - *Windows Service verification command:* `net start MongoDB` or `Get-Service MongoDB`
- **Package Manager:** npm (bundled with Node.js)

---

## 🚀 Installation & Setup Guide

### 1. Clone or Open the Workspace
```powershell
cd c:\Users\Toushif\OneDrive\Desktop\PartTimeConnect
```

### 2. Configure Backend Environment
Navigate to `server/` and verify the `.env` file:
```properties
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/parttimeconnect
JWT_SECRET=parttimeconnect_super_secret_jwt_key_2026_mca_project
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
```powershell
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
cd ..
```

### 4. Seed the Database
Populate your local MongoDB with realistic mock data (categories, students, employers, job listings, applications, interviews, notifications):
```powershell
cd server
npm run seed
cd ..
```

### 5. Start the Application
You can run the backend and frontend in two separate terminal windows:

**Terminal 1 (Backend API):**
```powershell
cd server
npm run dev
# Server will listen on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```powershell
cd client
npm run dev
# Client will be accessible at http://localhost:5173
```

---

## 🔑 Database Seeding & Demo Credentials

The database seeder (`server/scripts/seed.js`) automatically initializes sample accounts for testing all user roles. The demo password for **all** pre-seeded accounts is:

> **Password:** `Password123!`

| Role | Email Address | Description |
| :--- | :--- | :--- |
| **System Admin** | `admin@parttimeconnect.com` | Complete access to user management, moderation, categories, and analytics |
| **Employer 1** | `vikram@techinnovators.com` | Tech Innovators India (Software & Technology) |
| **Employer 2** | `pooja@creativecanvas.com` | Creative Canvas Studios (Media & Design) |
| **Employer 3** | `anil@apexdatasolutions.com` | Apex Data Solutions (Data & Analytics) |
| **Student 1** | `student@parttimeconnect.com` | Toushif Ahmed (MCA Student, Full-Stack Developer) |
| **Student 2** | `aarav@student.com` | Aarav Patel (B.Sc CS, UI/UX Designer) |
| **Student 3** | `sneha@student.com` | Sneha Rao (B.Com, Content Writer & SEO Specialist) |

*(Note: The Login screen includes convenient 1-click demo login buttons to instantly autofill these credentials during presentations and evaluation).*

---

## 🧪 Automated Testing with Jest & Supertest

PartTimeConnect features comprehensive automated integration tests verifying authentication, role enforcement, job query filters, application workflows, interview scheduling, and admin restrictions.

Run the test suite from the `server/` directory:
```powershell
cd server
npm test
```

### Test Suites Overview (21/21 Tests Passing):
1. **`tests/auth.test.js`**
   - Student & Employer registration
   - Duplicate email rejection
   - Password hashing verification
   - JWT login and invalid credentials rejection
   - Public admin registration blockage
2. **`tests/jobs.test.js`**
   - Job creation by authenticated employer
   - Rejection of job posting by student accounts
   - Keyword search across title and description
   - Filtering by work mode, job type, and category
   - Pagination and sorting verification
3. **`tests/applications.test.js`**
   - Student job application submission
   - Prevention of duplicate job applications (400 Bad Request)
   - Bookmark / Save and Unsave job toggling
   - Employer applicant viewing (restricted to job owner)
   - Application status updates with notification dispatch
4. **`tests/interviews_reports_admin.test.js`**
   - Employer interview scheduling
   - Student in-app notifications retrieval
   - Student reporting suspicious job listing
   - Admin user blocking (blocked user JWT rejection)
   - Unauthorized resume download rejection (403 Forbidden)

---

## 📡 REST API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Student or Employer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and session data |

### Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | List all active categories with job counts |
| `POST` | `/api/categories` | Admin | Create a new job category |
| `PUT` | `/api/categories/:id` | Admin | Update existing category |
| `DELETE` | `/api/categories/:id` | Admin | Remove category |

### Jobs (`/api/jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public | Search, filter, sort, and paginate active jobs |
| `GET` | `/api/jobs/:id` | Public | Retrieve single job details with company info |
| `POST` | `/api/jobs` | Employer | Create and publish a new job listing |
| `PUT` | `/api/jobs/:id` | Employer (Owner) | Update existing job listing |
| `DELETE` | `/api/jobs/:id` | Employer (Owner) | Delete job listing |
| `PATCH` | `/api/jobs/:id/status` | Employer (Owner) | Toggle job active/paused status |

### Student Profile & Features (`/api/students`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students/profile` | Student | Get personal profile, skills, and resume details |
| `PUT` | `/api/students/profile` | Student | Update education, contact, bio, and skills list |
| `POST` | `/api/students/resume` | Student | Upload resume document (Multer, max 5MB) |
| `GET` | `/api/students/resume` | Student | Download personal resume |
| `DELETE` | `/api/students/resume` | Student | Delete existing uploaded resume |
| `GET` | `/api/students/recommended-jobs` | Student | Get smart skill-matched job recommendations |
| `GET` | `/api/students/dashboard` | Student | Get student dashboard summary metrics |

### Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications` | Student | Apply for a job with cover letter |
| `GET` | `/api/applications/my` | Student | View all personal job applications |
| `GET` | `/api/applications/:id` | Student/Employer | View detailed application & timeline |
| `DELETE` | `/api/applications/:id` | Student (Applicant) | Withdraw a pending job application |
| `GET` | `/api/applications/job/:jobId` | Employer (Owner) | View all candidates for an employer's job |
| `PATCH` | `/api/applications/:id/status` | Employer (Owner) | Update candidate hiring stage status |
| `GET` | `/api/applications/:id/resume` | Employer (Owner) | Securely download candidate resume |

### Saved Jobs (`/api/saved-jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/saved-jobs` | Student | View list of bookmarked jobs |
| `POST` | `/api/saved-jobs/:jobId` | Student | Save a job listing |
| `DELETE` | `/api/saved-jobs/:jobId` | Student | Remove a job listing from saved list |

### Interviews (`/api/interviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/interviews` | Employer | Schedule an interview for an applicant |
| `GET` | `/api/interviews/my` | Student / Employer | View scheduled interviews |
| `PATCH` | `/api/interviews/:id` | Employer | Reschedule or cancel interview |

### Notifications & Reports
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | Fetch user alerts & interview notifications |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Mark notification as read |
| `POST` | `/api/reports` | Student | Report a suspicious or abusive job listing |

### Admin Moderation (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin | System statistics and analytics |
| `GET` | `/api/admin/users` | Admin | List, search, and filter all registered users |
| `PATCH` | `/api/admin/users/:id/block` | Admin | Block or unblock a user account |
| `GET` | `/api/admin/jobs` | Admin | Browse and moderate all job listings |
| `DELETE` | `/api/admin/jobs/:id` | Admin | Forcibly remove an inappropriate listing |
| `GET` | `/api/admin/reports` | Admin | List all flagged job reports |
| `PATCH` | `/api/admin/reports/:id` | Admin | Review, dismiss, or resolve a report |

---

## 🧠 Skill Recommendation Engine

The recommendation engine (`server/services/recommendationService.js`) uses a transparent, deterministic matching algorithm tailored for student part-time hiring:

1. **Skill Normalization:** Student profile skills and job required skills are sanitized (lowercased, trimmed, and deduplicated).
2. **Intersection Calculation:**
   $$\text{Matching Skills} = \text{Student Skills} \cap \text{Job Skills}$$
   $$\text{Missing Skills} = \text{Job Skills} \setminus \text{Student Skills}$$
3. **Score Formulation:**
   $$\text{Match Percentage} = \min\left(100, \text{round}\left(\frac{|\text{Matching Skills}|}{|\text{Job Skills}|} \times 100\right)\right)$$
4. **Actionable Feedback:** Each job recommendation includes the calculated match score, green pills for matched skills, and amber pills for missing skills so students know exactly what to learn next.

---

## 🔒 Security & Role-Based Authorization

1. **Role-Based Access Control (RBAC):** Backend routes are guarded by `authMiddleware.js` and `roleMiddleware.js`. Tampering with client-side UI states cannot grant access to unauthorized endpoints.
2. **Password Security:** Passwords are encrypted using `bcryptjs` with 10 salt rounds. Plaintext passwords are never logged or stored.
3. **Private File Uploads:** Uploaded resumes are stored outside public web directories in `server/uploads/resumes/`. File extensions are restricted to `.pdf`, `.doc`, and `.docx` with a 5 MB file size limit. Resumes can only be downloaded by the student owner or the employer who posted the specific job.
4. **Duplicate Prevention:** MongoDB compound unique index `{ job: 1, student: 1 }` prevents duplicate submissions at the database level.
5. **Account Blocking Enforcement:** Blocked accounts are immediately denied JWT authorization across all protected API routes.
6. **Input Sanitization & Error Masking:** Centralized `errorMiddleware.js` handles Mongoose validation errors, duplicate keys, and invalid ObjectIds without exposing server stack traces in production mode.

---

## 👥 Authors & Academic Context

- **Project Title:** PartTimeConnect – Student Part-Time Job Portal Using MERN Stack
- **Curriculum:** Master of Computer Applications (MCA) Mini Project
- **Developer:** Toushif Ahmed
- **Year:** 2026
