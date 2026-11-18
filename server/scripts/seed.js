const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const EmployerProfile = require('../models/EmployerProfile');
const Category = require('../models/Category');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Notification = require('../models/Notification');
const Interview = require('../models/Interview');
const JobReport = require('../models/JobReport');

const DEMO_PASSWORD = 'Password123!';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parttimeconnect';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected. Cleaning existing collections for clean seed...');

    // Clean existing data for idempotency
    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      EmployerProfile.deleteMany({}),
      Category.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      SavedJob.deleteMany({}),
      Notification.deleteMany({}),
      Interview.deleteMany({}),
      JobReport.deleteMany({}),
    ]);

    console.log('Collections cleared. Seeding initial data...');

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@parttimeconnect.com',
      password: DEMO_PASSWORD,
      role: 'admin',
    });
    console.log(`Admin created: ${adminUser.email}`);

    // 2. Create Employers
    const employersData = [
      {
        name: 'Vikram Mehta',
        email: 'vikram@techinnovators.com',
        companyName: 'Tech Innovators India',
        companyWebsite: 'https://techinnovators.example.com',
        industry: 'Software & Technology',
        companySize: '51-200',
        location: 'Bengaluru, Karnataka',
        companyDescription:
          'Leading edge software development agency building next-generation web & mobile cloud solutions.',
        contactPhone: '+91 98765 43210',
      },
      {
        name: 'Pooja Sharma',
        email: 'pooja@creativecanvas.com',
        companyName: 'Creative Canvas Studios',
        companyWebsite: 'https://creativecanvas.example.com',
        industry: 'Media & Design',
        companySize: '11-50',
        location: 'Mumbai, Maharashtra',
        companyDescription:
          'Boutique brand agency crafting digital experiences, visual identities, and social campaigns.',
        contactPhone: '+91 98220 12345',
      },
      {
        name: 'Anil Deshmukh',
        email: 'anil@apexdatasolutions.com',
        companyName: 'Apex Data Solutions',
        companyWebsite: 'https://apexdata.example.com',
        industry: 'Data & Analytics',
        companySize: '11-50',
        location: 'Pune, Maharashtra',
        companyDescription:
          'Specialists in business intelligence, data pipelining, and automated business analytics.',
        contactPhone: '+91 97110 56789',
      },
    ];

    const createdEmployers = [];
    for (const emp of employersData) {
      const user = await User.create({
        name: emp.name,
        email: emp.email,
        password: DEMO_PASSWORD,
        role: 'employer',
      });
      await EmployerProfile.create({
        user: user._id,
        companyName: emp.companyName,
        companyWebsite: emp.companyWebsite,
        industry: emp.industry,
        companySize: emp.companySize,
        location: emp.location,
        companyDescription: emp.companyDescription,
        contactPhone: emp.contactPhone,
      });
      createdEmployers.push(user);
    }
    console.log(`Created ${createdEmployers.length} employers.`);

    // 3. Create Students
    const studentsData = [
      {
        name: 'Toushif Ahmed',
        email: 'student@parttimeconnect.com', // Primary demo student
        college: 'National Institute of Technology',
        course: 'MCA (Master of Computer Applications)',
        graduationYear: 2026,
        phone: '+91 98450 11223',
        bio: 'Passionate MCA student and full-stack developer experienced in JavaScript, React, Node.js, and MongoDB.',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'HTML', 'CSS', 'Git'],
        location: 'Bengaluru, Karnataka',
      },
      {
        name: 'Aarav Patel',
        email: 'aarav@student.com',
        college: 'St. Xavier College',
        course: 'B.Sc Computer Science',
        graduationYear: 2025,
        phone: '+91 91234 56789',
        bio: 'Frontend enthusiast with an eye for UI/UX design, Figma, and modern responsive layouts.',
        skills: ['UI/UX Design', 'Figma', 'CSS', 'HTML', 'JavaScript', 'Tailwind', 'React'],
        location: 'Mumbai, Maharashtra',
      },
      {
        name: 'Sneha Rao',
        email: 'sneha@student.com',
        college: 'Pune University',
        course: 'B.Com & Digital Marketing',
        graduationYear: 2026,
        phone: '+91 99887 76655',
        bio: 'Content strategist, SEO copywriter, and social media enthusiast looking for flexible part-time roles.',
        skills: ['Content Writing', 'SEO', 'Copywriting', 'Social Media', 'Canva', 'Blogging'],
        location: 'Pune, Maharashtra',
      },
    ];

    const createdStudents = [];
    for (const stu of studentsData) {
      const user = await User.create({
        name: stu.name,
        email: stu.email,
        password: DEMO_PASSWORD,
        role: 'student',
      });
      await StudentProfile.create({
        user: user._id,
        college: stu.college,
        course: stu.course,
        graduationYear: stu.graduationYear,
        phone: stu.phone,
        bio: stu.bio,
        skills: stu.skills,
        location: stu.location,
        resume: {
          filename: `demo-resume-${user._id}.pdf`,
          originalName: `${stu.name.replace(' ', '_')}_Resume.pdf`,
          mimeType: 'application/pdf',
          size: 154200,
          uploadDate: new Date(),
          path: require('path').join(__dirname, `../uploads/resumes/demo-resume-${user._id}.pdf`),
        },
      });
      createdStudents.push(user);
    }
    console.log(`Created ${createdStudents.length} students.`);

    // 4. Create Categories
    const categoriesData = [
      { name: 'Web Development', slug: 'web-development', icon: 'Code', description: 'Frontend, backend, and full-stack development jobs.' },
      { name: 'Mobile App Development', slug: 'mobile-app-dev', icon: 'Smartphone', description: 'React Native, Flutter, iOS, and Android development.' },
      { name: 'UI/UX Design', slug: 'ui-ux-design', icon: 'Palette', description: 'Figma, wireframing, prototyping, and visual design.' },
      { name: 'Content Writing', slug: 'content-writing', icon: 'FileText', description: 'Blog articles, copywriting, SEO content, and technical writing.' },
      { name: 'Digital Marketing', slug: 'digital-marketing', icon: 'TrendingUp', description: 'Social media management, SEO, and paid ad campaigns.' },
      { name: 'Data Entry & Analysis', slug: 'data-entry', icon: 'Database', description: 'Data processing, Excel spreadsheets, and analytics.' },
      { name: 'Video Editing & Media', slug: 'video-editing', icon: 'Video', description: 'Reels, YouTube editing, animations, and graphic design.' },
      { name: 'Customer Support', slug: 'customer-support', icon: 'Headphones', description: 'Live chat assistance, email support, and client outreach.' },
    ];

    const createdCategories = [];
    for (const cat of categoriesData) {
      const c = await Category.create(cat);
      createdCategories.push(c);
    }
    console.log(`Created ${createdCategories.length} categories.`);

    // 5. Create 16 Realistic Part-Time Job Listings
    const jobsData = [
      {
        employer: createdEmployers[0]._id,
        category: createdCategories[0]._id, // Web Dev
        title: 'Junior React Frontend Developer (Part-Time)',
        description: 'We are seeking an energetic student developer to assist our core product team with building reusable React components, consuming REST APIs, and styling modern responsive dashboards. 15-20 hours per week with flexible schedule around your college classes.',
        jobType: 'part-time',
        workMode: 'remote',
        location: 'Bengaluru, Karnataka',
        requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
        stipend: { amount: 15000, frequency: 'monthly', isNegotiable: true },
        vacancies: 2,
        status: 'active',
      },
      {
        employer: createdEmployers[0]._id,
        category: createdCategories[0]._id, // Web Dev
        title: 'Node.js & Express Backend Intern',
        description: 'Opportunity for computer science students to gain real production experience creating RESTful endpoints, managing MongoDB collections, and writing unit test cases with Jest. Mentorship provided by senior engineers.',
        jobType: 'internship',
        workMode: 'remote',
        location: 'Bengaluru, Karnataka',
        requiredSkills: ['Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST API'],
        stipend: { amount: 18000, frequency: 'monthly', isNegotiable: false },
        vacancies: 2,
        status: 'active',
      },
      {
        employer: createdEmployers[1]._id,
        category: createdCategories[2]._id, // UI/UX Design
        title: 'Figma UI/UX Design Assistant',
        description: 'Join our creative design studio to create high-fidelity Figma components, user wireframes, and interactive click-through prototypes for client web applications. Flexible timings, portfolio review required.',
        jobType: 'part-time',
        workMode: 'hybrid',
        location: 'Mumbai, Maharashtra',
        requiredSkills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'CSS'],
        stipend: { amount: 12000, frequency: 'monthly', isNegotiable: true },
        vacancies: 1,
        status: 'active',
      },
      {
        employer: createdEmployers[1]._id,
        category: createdCategories[3]._id, // Content Writing
        title: 'Tech & Lifestyle Content Writer',
        description: 'Write engaging blog articles, SEO meta descriptions, and newsletter updates for our client portfolio. Topics range from software trends to college productivity tips. 3-4 articles per week.',
        jobType: 'part-time',
        workMode: 'remote',
        location: 'Mumbai, Maharashtra',
        requiredSkills: ['Content Writing', 'SEO', 'Copywriting', 'Research'],
        stipend: { amount: 8000, frequency: 'monthly', isNegotiable: false },
        vacancies: 3,
        status: 'active',
      },
      {
        employer: createdEmployers[2]._id,
        category: createdCategories[5]._id, // Data Entry & Analysis
        title: 'Excel & Data Verification Assistant',
        description: 'Help clean, format, and verify customer dataset spreadsheets. Basic knowledge of VLOOKUP, pivot tables, and attention to detail is essential. Perfect for students looking for evening work.',
        jobType: 'part-time',
        workMode: 'remote',
        location: 'Pune, Maharashtra',
        requiredSkills: ['Excel', 'Data Entry', 'Attention to Detail', 'Analytics'],
        stipend: { amount: 7500, frequency: 'monthly', isNegotiable: false },
        vacancies: 4,
        status: 'active',
      },
      {
        employer: createdEmployers[2]._id,
        category: createdCategories[5]._id, // Data Entry & Analysis
        title: 'Python Data Extraction Intern',
        description: 'Assist our data science team with writing clean Python scraping scripts, JSON formatting, and basic data wrangling using Pandas. Great opportunity to boost your data portfolio.',
        jobType: 'internship',
        workMode: 'remote',
        location: 'Pune, Maharashtra',
        requiredSkills: ['Python', 'Data Analysis', 'Pandas', 'JSON', 'Git'],
        stipend: { amount: 14000, frequency: 'monthly', isNegotiable: true },
        vacancies: 1,
        status: 'active',
      },
      {
        employer: createdEmployers[0]._id,
        category: createdCategories[1]._id, // Mobile App Dev
        title: 'Flutter / React Native Mobile Intern',
        description: 'Work with cross-platform mobile app development. Assist in fixing layout bugs, testing on Android & iOS devices, and optimizing performance for client mobile products.',
        jobType: 'internship',
        workMode: 'remote',
        location: 'Bengaluru, Karnataka',
        requiredSkills: ['React Native', 'Flutter', 'JavaScript', 'Mobile UI'],
        stipend: { amount: 16000, frequency: 'monthly', isNegotiable: false },
        vacancies: 2,
        status: 'active',
      },
      {
        employer: createdEmployers[1]._id,
        category: createdCategories[4]._id, // Digital Marketing
        title: 'Social Media & Campus Influencer Coordinator',
        description: 'Coordinate Instagram, LinkedIn, and campus outreach campaigns. Plan content calendars, engage with student communities, and monitor post analytics.',
        jobType: 'part-time',
        workMode: 'remote',
        location: 'Mumbai, Maharashtra',
        requiredSkills: ['Social Media', 'Canva', 'Digital Marketing', 'Communication'],
        stipend: { amount: 9000, frequency: 'monthly', isNegotiable: false },
        vacancies: 2,
        status: 'active',
      },
      {
        employer: createdEmployers[1]._id,
        category: createdCategories[6]._id, // Video Editing
        title: 'Shorts & Reels Video Editor',
        description: 'Edit engaging short-form vertical videos (Reels, TikTok, YouTube Shorts) for product announcements and educational campaigns. Premiere Pro or CapCut proficiency needed.',
        jobType: 'part-time',
        workMode: 'remote',
        location: 'Mumbai, Maharashtra',
        requiredSkills: ['Video Editing', 'Premiere Pro', 'CapCut', 'Storytelling'],
        stipend: { amount: 11000, frequency: 'monthly', isNegotiable: true },
        vacancies: 2,
        status: 'active',
      },
      {
        employer: createdEmployers[2]._id,
        category: createdCategories[7]._id, // Customer Support
        title: 'Weekend Student Helpdesk Specialist',
        description: 'Provide quick and friendly ticket and live chat responses to customers on weekends. Shifts can be scheduled around your college timetable.',
        jobType: 'part-time',
        workMode: 'remote',
        location: 'Pune, Maharashtra',
        requiredSkills: ['Customer Support', 'Communication', 'Problem Solving'],
        stipend: { amount: 8500, frequency: 'monthly', isNegotiable: false },
        vacancies: 2,
        status: 'active',
      },
      {
        employer: createdEmployers[0]._id,
        category: createdCategories[0]._id, // Web Dev
        title: 'Full Stack MERN Junior Developer',
        description: 'Build full-featured web modules using MongoDB, Express, React, and Node.js. Ideal for final-year MCA/B.Tech students looking for high-impact part-time experience.',
        jobType: 'part-time',
        workMode: 'hybrid',
        location: 'Bengaluru, Karnataka',
        requiredSkills: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript'],
        stipend: { amount: 20000, frequency: 'monthly', isNegotiable: true },
        vacancies: 1,
        status: 'active',
      },
      {
        employer: createdEmployers[2]._id,
        category: createdCategories[0]._id, // Web Dev
        title: 'WordPress & Landing Page Builder',
        description: 'Build responsive landing pages using Elementor, modern HTML/CSS, and custom JavaScript snippets. Ensure fast load times and cross-browser responsiveness.',
        jobType: 'part-time',
        workMode: 'remote',
        location: 'Pune, Maharashtra',
        requiredSkills: ['WordPress', 'HTML', 'CSS', 'JavaScript'],
        stipend: { amount: 10000, frequency: 'monthly', isNegotiable: false },
        vacancies: 2,
        status: 'active',
      },
      {
        employer: createdEmployers[1]._id,
        category: createdCategories[3]._id, // Content Writing
        title: 'SEO Copywriter & Technical Blogger',
        description: 'Research keywords and write comprehensive 1,500-word guides on web engineering, design principles, and student careers. Training provided on SEO best practices.',
        jobType: 'part-time',
        workMode: 'remote',
        location: 'Mumbai, Maharashtra',
        requiredSkills: ['SEO', 'Content Writing', 'Copywriting', 'Research'],
        stipend: { amount: 10000, frequency: 'monthly', isNegotiable: false },
        vacancies: 1,
        status: 'active',
      },
      {
        employer: createdEmployers[0]._id,
        category: createdCategories[2]._id, // UI/UX
        title: 'Web Graphic Designer (Part-Time)',
        description: 'Design banner graphics, blog post illustrations, and product landing page visual elements using Figma and Photoshop. Minimum 10 hours per week.',
        jobType: 'part-time',
        workMode: 'remote',
        location: 'Bengaluru, Karnataka',
        requiredSkills: ['UI/UX Design', 'Figma', 'Photoshop', 'Canva'],
        stipend: { amount: 9500, frequency: 'monthly', isNegotiable: true },
        vacancies: 2,
        status: 'active',
      },
      {
        employer: createdEmployers[2]._id,
        category: createdCategories[5]._id, // Data Entry
        title: 'Operations & Spreadsheet Associate',
        description: 'Maintain weekly internal operations data, generate weekly progress charts, and coordinate with branch supervisors. Flexible hours.',
        jobType: 'part-time',
        workMode: 'on-site',
        location: 'Pune, Maharashtra',
        requiredSkills: ['Excel', 'Data Entry', 'Google Sheets'],
        stipend: { amount: 8000, frequency: 'monthly', isNegotiable: false },
        vacancies: 1,
        status: 'active',
      },
      {
        employer: createdEmployers[0]._id,
        category: createdCategories[0]._id, // Web Dev
        title: 'Legacy Internal Tool Maintenance (Paused)',
        description: 'Maintenance and bug fixes for our legacy internal ticketing dashboard.',
        jobType: 'part-time',
        workMode: 'remote',
        location: 'Bengaluru, Karnataka',
        requiredSkills: ['JavaScript', 'HTML', 'CSS'],
        stipend: { amount: 7000, frequency: 'monthly', isNegotiable: false },
        vacancies: 1,
        status: 'paused', // One paused job for testing
      },
    ];

    const createdJobs = [];
    for (const job of jobsData) {
      const j = await Job.create(job);
      createdJobs.push(j);
    }
    console.log(`Created ${createdJobs.length} job listings.`);

    // 6. Create Demo Applications
    const app1 = await Application.create({
      job: createdJobs[0]._id, // React Frontend Dev
      student: createdStudents[0]._id, // Toushif
      employer: createdEmployers[0]._id,
      status: 'shortlisted',
      coverNote:
        'Hi, I am an MCA student passionate about React.js. I have built multiple interactive web applications and would love to contribute to your team!',
      resumeSnapshot: {
        filename: `demo-resume-${createdStudents[0]._id}.pdf`,
        originalName: 'Toushif_Ahmed_Resume.pdf',
        mimeType: 'application/pdf',
      },
      timeline: [
        {
          status: 'applied',
          note: 'Application submitted by student.',
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedBy: createdStudents[0]._id,
        },
        {
          status: 'shortlisted',
          note: 'Strong React background. Shortlisted for technical round.',
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedBy: createdEmployers[0]._id,
        },
      ],
    });

    const app2 = await Application.create({
      job: createdJobs[1]._id, // Node.js Backend Intern
      student: createdStudents[0]._id, // Toushif
      employer: createdEmployers[0]._id,
      status: 'interview_scheduled',
      coverNote:
        'I have hands-on experience building REST APIs with Express and Mongoose. Excited about this opportunity.',
      resumeSnapshot: {
        filename: `demo-resume-${createdStudents[0]._id}.pdf`,
        originalName: 'Toushif_Ahmed_Resume.pdf',
        mimeType: 'application/pdf',
      },
      timeline: [
        {
          status: 'applied',
          note: 'Application submitted by student.',
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          updatedBy: createdStudents[0]._id,
        },
        {
          status: 'interview_scheduled',
          note: 'Interview scheduled via Google Meet.',
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedBy: createdEmployers[0]._id,
        },
      ],
    });

    // Update job application counts
    await Job.findByIdAndUpdate(createdJobs[0]._id, { $inc: { applicationsCount: 1 } });
    await Job.findByIdAndUpdate(createdJobs[1]._id, { $inc: { applicationsCount: 1 } });

    // 7. Create Demo Interview
    await Interview.create({
      application: app2._id,
      job: createdJobs[1]._id,
      student: createdStudents[0]._id,
      employer: createdEmployers[0]._id,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      mode: 'online',
      meetingLinkOrLocation: 'https://meet.google.com/demo-ptc-interview',
      instructions: 'Please be prepared to discuss Express middleware and REST design.',
      status: 'scheduled',
    });

    // 8. Create Demo Saved Jobs
    await SavedJob.create({
      student: createdStudents[0]._id,
      job: createdJobs[10]._id, // Full Stack MERN
    });
    await SavedJob.create({
      student: createdStudents[0]._id,
      job: createdJobs[2]._id, // UI/UX Design Assistant
    });

    // 9. Create Demo Notifications
    await Notification.create({
      recipient: createdStudents[0]._id,
      sender: createdEmployers[0]._id,
      title: 'Interview Scheduled!',
      message: 'Tech Innovators India scheduled an interview for Node.js & Express Backend Intern.',
      type: 'interview_scheduled',
      relatedId: app2._id,
    });
    await Notification.create({
      recipient: createdStudents[0]._id,
      sender: createdEmployers[0]._id,
      title: 'Application Shortlisted',
      message: 'Congratulations! Your application for Junior React Frontend Developer has been shortlisted.',
      type: 'status_updated',
      relatedId: app1._id,
    });
    await Notification.create({
      recipient: createdEmployers[0]._id,
      sender: createdStudents[0]._id,
      title: 'New Job Application',
      message: 'Toushif Ahmed applied for Junior React Frontend Developer.',
      type: 'application_submitted',
      relatedId: app1._id,
    });

    // 10. Create Demo Report for Admin Moderation
    await JobReport.create({
      job: createdJobs[4]._id,
      reportedBy: createdStudents[1]._id,
      reason: 'incorrect_information',
      details: 'Work location states Remote, but contact person asked for on-site visits.',
      status: 'pending',
    });

    console.log('====================================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('DEMO ACCOUNTS:');
    console.log('Admin:');
    console.log(`  Email:    admin@parttimeconnect.com`);
    console.log(`  Password: ${DEMO_PASSWORD}`);
    console.log('Employers:');
    console.log(`  Email:    vikram@techinnovators.com`);
    console.log(`  Email:    pooja@creativecanvas.com`);
    console.log(`  Password: ${DEMO_PASSWORD}`);
    console.log('Students:');
    console.log(`  Email:    student@parttimeconnect.com`);
    console.log(`  Email:    aarav@student.com`);
    console.log(`  Password: ${DEMO_PASSWORD}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Database Seeding Failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
